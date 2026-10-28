import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { validateCsrfOrigin } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * GET /api/instagram/insights
 * Fetches Instagram Business account insights (reach, profile_views) per day.
 * Returns byDate: { "YYYY-MM-DD": { reach: number, profileViews: number } }
 * Requires instagram_business_manage_insights permission.
 */
export async function GET(request: NextRequest) {
  try {
    // Global rate limiting: 10 req/min per user
    const serverClientForAuth = await createServerClient();
    const { data: { user: authUser } } = await serverClientForAuth.auth.getUser();
    const rateLimitKey = authUser?.id ?? (request.headers.get("x-forwarded-for") ?? "unknown");
    const allowed = await checkRateLimit("insights", rateLimitKey, 10, 60);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = authUser;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("instagram_token")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.instagram_token) {
      return NextResponse.json({ error: "No Instagram token" }, { status: 404 });
    }

    const accessToken = decrypt(profile.instagram_token);

    // Fetch 30 days of daily reach + profile_views (with resilient fallback to reach-only if profile_views is unsupported)
    const until = Math.floor(Date.now() / 1000);
    const since = until - 30 * 24 * 60 * 60;

    let insightsRes = await fetch(
      `https://graph.instagram.com/v21.0/me/insights?metric=reach,profile_views&period=day&since=${since}&until=${until}&access_token=${accessToken}`,
      { cache: "no-store" }
    );

    let insightsData = await insightsRes.json();

    // If Meta returns an error regarding metrics (e.g., #100 profile_views not available for this account type), fallback to reach
    if (insightsData.error) {
      console.warn("[instagram/insights] Primary metrics query failed, falling back to reach-only:", insightsData.error.message);
      insightsRes = await fetch(
        `https://graph.instagram.com/v21.0/me/insights?metric=reach&period=day&since=${since}&until=${until}&access_token=${accessToken}`,
        { cache: "no-store" }
      );
      insightsData = await insightsRes.json();
    }

    if (insightsData.error) {
      console.warn("[instagram/insights] Final API error:", insightsData.error.message);
      return NextResponse.json({
        available: false,
        reason: insightsData.error.message,
        byDate: {},
      });
    }

    // Parse into { "YYYY-MM-DD": { reach, profileViews } }
    const byDate: Record<string, { reach: number; profileViews: number }> = {};

    const metrics = insightsData.data ?? [];
    for (const metric of metrics) {
      const values: { value: number; end_time: string }[] = metric.values ?? [];
      for (const entry of values) {
        // end_time is ISO string like "2026-08-09T07:00:00+0000"
        const dateKey = entry.end_time.substring(0, 10); // "YYYY-MM-DD"
        if (!byDate[dateKey]) byDate[dateKey] = { reach: 0, profileViews: 0 };
        if (metric.name === "reach") byDate[dateKey].reach = entry.value;
        if (metric.name === "profile_views") byDate[dateKey].profileViews = entry.value;

        // Also map to previous calendar date in case end_time marks the end of day (e.g. 00:00:00 or 07:00:00 UTC)
        const endDateObj = new Date(entry.end_time);
        const prevDateObj = new Date(endDateObj.getTime() - 24 * 60 * 60 * 1000);
        const prevDateKey = prevDateObj.toISOString().substring(0, 10);
        if (!byDate[prevDateKey]) {
          byDate[prevDateKey] = { reach: entry.value, profileViews: metric.name === "profile_views" ? entry.value : 0 };
        }
      }
    }

    return NextResponse.json({
      available: true,
      byDate,
    });
  } catch (err: any) {
    console.error("[instagram/insights] Unexpected error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
