import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { validateCsrfOrigin } from "@/lib/csrf";

// Simple in-memory rate limiter (per IP, 10 req/min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

// Server-side route — derives userId from session (NOT from query param) to prevent IDOR
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // CSRF check
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Authenticate — get the calling user's session
    const serverClient = await createServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch token + cached stats from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("instagram_token, instagram_username, instagram_followers_count, instagram_following_count, instagram_media_count, instagram_profile_picture_url")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.instagram_token) {
      return NextResponse.json({ error: "No Instagram token" }, { status: 404 });
    }

    const accessToken = decrypt(profile.instagram_token);

    if (!accessToken || accessToken === profile.instagram_token) {
      console.warn("[instagram/stats] Token may not have decrypted correctly");
    }

    // Call Instagram Graph API
    let igData: any = {};
    try {
      const igRes = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=username,media_count,followers_count,follows_count&access_token=${accessToken}`,
        { cache: "no-store" }
      );
      igData = await igRes.json();
    } catch (fetchErr) {
      console.warn("[instagram/stats] Network error fetching from Instagram:", fetchErr);
    }

    if (igData.error) {
      // Instagram API failed — fall back to DB-cached values
      console.warn("[instagram/stats] Instagram API error, using cached DB values:", igData.error.message);
      return NextResponse.json({
        followers: profile.instagram_followers_count ?? 0,
        following: profile.instagram_following_count ?? 0,
        postsCount: profile.instagram_media_count ?? 0,
        username: profile.instagram_username ?? "",
        profilePictureUrl: profile.instagram_profile_picture_url ?? null,
        source: "cache",
        insightsAvailable: false,
      });
    }

    // Extract live fields — followers_count & media_count are supported in instagram_business_basic
    // follows_count is NOT supported in this scope, so we use DB-cached value for following
    const postsCount = igData.media_count ?? 0;
    const username = igData.username ?? profile.instagram_username ?? "";
    const liveFollowers = igData.followers_count ?? null;
    const liveFollowing = igData.follows_count ?? null;

    // Cache live values back to profiles table
    const updatePayload: Record<string, any> = {};
    if (postsCount > 0) updatePayload.instagram_media_count = postsCount;
    if (username) updatePayload.instagram_username = username;
    if (liveFollowers !== null) updatePayload.instagram_followers_count = liveFollowers;
    if (liveFollowing !== null) updatePayload.instagram_following_count = liveFollowing;

    if (Object.keys(updatePayload).length > 0) {
      await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId);
    }

    return NextResponse.json({
      followers: liveFollowers ?? profile.instagram_followers_count ?? 0,
      following: liveFollowing ?? profile.instagram_following_count ?? 0,
      postsCount: postsCount > 0 ? postsCount : (profile.instagram_media_count ?? 0),
      username,
      profilePictureUrl: profile.instagram_profile_picture_url ?? null,
      source: "live",
      insightsAvailable: false,
      followersSource: "live_api",
    });
  } catch (err) {
    console.error("[instagram/stats] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
