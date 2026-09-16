import { createClient } from "@supabase/supabase-js";

/**
 * Global rate limiter backed by Supabase.
 *
 * Unlike in-memory limiters, this works correctly across multiple
 * serverless instances and Vercel regions — a single shared counter
 * lives in the database rather than per-process memory.
 *
 * Usage:
 *   const allowed = await checkRateLimit("publish", userId, 5, 60);
 *   if (!allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
 */

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Check and increment a rate limit counter.
 *
 * @param action   - A string key identifying the action (e.g. "publish", "insights")
 * @param identifier - The user ID or IP address to rate-limit
 * @param maxRequests - Maximum number of requests allowed within the window
 * @param windowSeconds - Window duration in seconds
 * @returns true if the request is allowed, false if the limit is exceeded
 */
export async function checkRateLimit(
  action: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const supabase = getAdminClient();

  // Fall back to allowing the request if DB isn't configured
  if (!supabase) return true;

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000).toISOString();
  const key = `${action}:${identifier}`;

  try {
    // Count requests in the current window
    const { count, error } = await supabase
      .from("rate_limit_events")
      .select("*", { count: "exact", head: true })
      .eq("rate_key", key)
      .gte("created_at", windowStart);

    if (error) {
      // If the table doesn't exist yet, fail open (allow the request)
      console.warn("[rate-limit] DB error — allowing request:", error.message);
      return true;
    }

    if ((count ?? 0) >= maxRequests) {
      return false;
    }

    // Record this request
    await supabase.from("rate_limit_events").insert({
      rate_key: key,
      created_at: now.toISOString(),
    });

    return true;
  } catch (err: any) {
    console.warn("[rate-limit] Unexpected error — allowing request:", err.message);
    return true;
  }
}
