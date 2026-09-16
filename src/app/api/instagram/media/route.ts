import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { validateCsrfOrigin } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

// Server-side route — derives userId from session (NOT from query param) to prevent IDOR
export async function GET(request: NextRequest) {
  try {
    // Global rate limiting: 10 req/min per user
    const serverClientForAuth = await createServerClient();
    const { data: { user: authUser } } = await serverClientForAuth.auth.getUser();
    const rateLimitKey = authUser?.id ?? (request.headers.get("x-forwarded-for") ?? "unknown");
    const allowed = await checkRateLimit("media", rateLimitKey, 10, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // CSRF check
    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Authenticate the request — get the calling user's session
    const serverClient = await createServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Always use the authenticated user's own ID — never trust a client-supplied userId
    const userId = user.id;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("instagram_token")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.instagram_token) {
      return NextResponse.json({ error: "No Instagram token" }, { status: 404 });
    }

    const accessToken = decrypt(profile.instagram_token);

    // Fetch real engagement data from Instagram Graph API
    // like_count and comments_count are available via basic scope on Graph API for professional accounts.
    // Reach/Impressions still require the separate insights edge.
    const mediaRes = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,timestamp,media_type,caption,permalink,like_count,comments_count&limit=50&access_token=${accessToken}`,
      { next: { revalidate: 0 } }
    );

    const mediaData = await mediaRes.json();

    if (mediaData.error) {
      return NextResponse.json(
        { error: mediaData.error.message || "Instagram API error" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      items: mediaData.data ?? [],
      // Flag that engagement metrics (likes, comments) are unavailable without instagram_manage_insights
      engagementAvailable: false,
    });
  } catch (err) {
    console.error("[instagram/media] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
