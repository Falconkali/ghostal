import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { encrypt } from "@/lib/crypto";


export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  
  // Instagram appends #_ to the redirect URI, next.js searchParams will parse the code correctly
  let code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const stateReturned = searchParams.get("state");

  let redirectUrl = `${origin}/settings`;

  if (errorParam || errorDescription) {
    console.error("Instagram OAuth error:", errorParam, errorDescription);
    return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(errorDescription || errorParam || "OAuth failed")}`);
  }

  if (!code) {
    console.error("Instagram OAuth error: No code returned");
    return NextResponse.redirect(`${redirectUrl}?error=no_authorization_code`);
  }

  // ── OAuth State (CSRF) Validation ──────────────────────────────────────────
  // The state token was stored in a cookie when the OAuth flow was initiated.
  // Verify it matches the value returned by Instagram to prevent CSRF attacks.
  const storedState = request.cookies.get("ig_oauth_state")?.value;
  if (!storedState || !stateReturned || storedState !== stateReturned) {
    console.error("Instagram OAuth CSRF check failed: state mismatch", { storedState, stateReturned });
    return NextResponse.redirect(`${redirectUrl}?error=oauth_state_mismatch`);
  }

  // Clean the code parameter if Instagram appended #_ to it
  if (code.endsWith("#_")) {
    code = code.substring(0, code.length - 2);
  }

  // Initialize Supabase Server Client to get current logged-in user
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  const response = NextResponse.next();
  
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options) {
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Unauthorized: No session found on callback");
    return NextResponse.redirect(`${origin}/login?error=unauthorized_callback`);
  }

  // Instagram App credentials for token exchange
  // client_id = Instagram App ID (or Meta App ID), client_secret = Instagram App Secret (or Meta App Secret)
  const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
  const clientSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET;
  const redirectUri = `${origin}/api/auth/instagram/callback`;

  if (!clientId || !clientSecret) {
    console.error("Missing Instagram App credentials in environment variables");
    return NextResponse.redirect(`${redirectUrl}?error=missing_config`);
  }

  try {
    // 1. Exchange the authorization code for a short-lived access token
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error_type || tokenData.error) {
      console.error("Short-lived token exchange error:", tokenData);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(tokenData.error_message || "Failed to exchange token")}`);
    }

    const shortLivedToken = tokenData.access_token;
    const instagramUserId = tokenData.user_id;

    // 2. Exchange for a long-lived token (valid 60 days)
    const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    if (longLivedData.error) {
      console.error("Long-lived token exchange error:", longLivedData.error);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(longLivedData.error.message || "Failed to get long-lived token")}`);
    }

    const longLivedToken = longLivedData.access_token;

    // 3. Fetch the Instagram username AND correct user ID from the long-lived token
    const profileRes = await fetch(`https://graph.instagram.com/v21.0/me?fields=id,username,profile_picture_url&access_token=${longLivedToken}`);
    const profileData = await profileRes.json();

    if (profileData.error) {
      console.error("Fetch Instagram profile error:", profileData.error);
      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(profileData.error.message || "Failed to fetch Instagram profile")}`);
    }

    const instagramHandle = profileData.username;
    const realInstagramId = profileData.id || String(instagramUserId);
    const profilePictureUrl = profileData.profile_picture_url || null;

    // 4. Fetch follower/following/post counts (available at connect time)
    let followersCount = 0;
    let followingCount = 0;
    let mediaCount = 0;
    try {
      const statsRes = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=followers_count,follows_count,media_count&access_token=${longLivedToken}`
      );
      const statsData = await statsRes.json();
      if (!statsData.error) {
        followersCount = statsData.followers_count ?? 0;
        followingCount = statsData.follows_count ?? 0;
        mediaCount = statsData.media_count ?? 0;
      }
    } catch {
      // Non-critical — counts will be fetched lazily later
    }

    // 4. Save to Supabase profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        instagram_connected: true,
        instagram_handle: instagramHandle,
        instagram_username: instagramHandle,
        instagram_token: encrypt(longLivedToken),
        instagram_id: realInstagramId,
        instagram_profile_picture_url: profilePictureUrl,
        instagram_followers_count: followersCount,
        instagram_following_count: followingCount,
        instagram_media_count: mediaCount,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.redirect(`${redirectUrl}?error=database_save_failed`);
    }

    // Clear the OAuth state cookie — it's single-use
    const successRedirect = NextResponse.redirect(`${redirectUrl}?success=instagram_connected`);
    successRedirect.cookies.set("ig_oauth_state", "", { path: "/", maxAge: 0 });
    return successRedirect;
  } catch (err: any) {
    console.error("Unhandled error in callback handler:", err);
    return NextResponse.redirect(`${redirectUrl}?error=unhandled_callback_exception`);
  }
}

