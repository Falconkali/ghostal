import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { validateCsrfOrigin } from "@/lib/csrf";

export const runtime = "nodejs";

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

/**
 * GET /api/instagram/insights
 * Fetches Instagram Business account insights (reach, profile_views) per day.
 * Returns byDate: { "YYYY-MM-DD": { reach: number, profileViews: number } }
 * Requires instagram_business_manage_insights permission.
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    if (!validateCsrfOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serverClient = await createServerClient();
    const { data: { user }, error: authError } = await serverClient.auth.getUser();

    if (authError || !user) {
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

    // Fetch 30 days of daily reach + profile_views
    const until = Math.floor(Date.now() / 1000);
    const since = until - 30 * 24 * 60 * 60;

    const insightsRes = await fetch(
      `https://graph.instagram.com/v21.0/me/insights?metric=reach,profile_views&period=day&since=${since}&until=${until}&access_token=${accessToken}`,
      { cache: "no-store" }
    );

    const insightsData = await insightsRes.json();

    if (insightsData.error) {
      console.warn("[instagram/insights] API error:", insightsData.error.message);
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
