import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { checkAndPublishDuePosts, runAISurvivalRefill } from "@/lib/automation";
import { decrypt, encrypt } from "@/lib/crypto";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes — needed for Instagram container polling (up to 30s per post)


export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed: if CRON_SECRET is not configured, deny all requests
  if (!cronSecret) {
    console.error("Cron Authorization failed: CRON_SECRET environment variable is not configured.");
    return new Response("Unauthorized — CRON_SECRET not configured", { status: 401 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn("Cron Authorization failed: Secret mismatch.");
    return new Response("Unauthorized", { status: 401 });
  }


  const adminClient = createAdminClient();

  try {
    // 1. Fetch active profiles that have Instagram connected and token/id populated
    const { data: profiles, error: profileError } = await adminClient
      .from("profiles")
      .select("id, ghost_mode_config, created_at, instagram_token")
      .eq("instagram_connected", true)
      .not("instagram_token", "is", null)
      .not("instagram_id", "is", null);

    if (profileError) {
      console.error("Cron Error: Failed to fetch profiles:", profileError);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No active connected profiles found to process." }, { status: 200 });
    }

    // 2. Loop over users and execute automation cycle in parallel (isolated)
    const settledResults = await Promise.allSettled(
      profiles.map(async (profile) => {
        const userId = profile.id;
        const config = (profile.ghost_mode_config || {
          enabled: false,
          inactivityThresholdDays: 3,
          preserveHashtags: true,
          emergencySurvivalMode: false,
        }) as any;

        // A. Token Refresh (Weekly prevention of 60-day expiry)
        let currentToken = profile.instagram_token;
        if (currentToken) {
          try {
            const decrypted = decrypt(currentToken);
            // Instagram allows refresh if token is >24h old
            const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${decrypted}`;
            const refreshRes = await fetch(refreshUrl);
            const refreshData = await refreshRes.json();
            
            if (refreshData.access_token && refreshData.access_token !== decrypted) {
              // Successfully got a new token, update DB
              currentToken = encrypt(refreshData.access_token);
              await adminClient
                .from("profiles")
                .update({ instagram_token: currentToken })
                .eq("id", userId);
              console.log(`[Cron] Refreshed Instagram token for user ${userId}`);
            }
          } catch (tokenErr) {
            console.error(`[Cron] Token refresh failed for user ${userId}:`, tokenErr);
          }
        }

        // B. Check and publish due posts
        const publishedIds = await checkAndPublishDuePosts(userId, adminClient);

        // C. Run AI survival refill checks
        // Get current queue count (future posts)
        const nowStr = new Date().toISOString();
        const { count: queueCount } = await adminClient
          .from("scheduled_posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "scheduled")
          .gt("scheduled_at", nowStr);

        const currentQueueCount = queueCount || 0;

        // Determine inactivity
        const { data: lastPosted } = await adminClient
          .from("scheduled_posts")
          .select("scheduled_at")
          .eq("user_id", userId)
          .in("status", ["posted", "ghost_posted"])
          .order("scheduled_at", { ascending: false })
          .limit(1);

        let daysSinceLastPost = 0;
        if (lastPosted && lastPosted.length > 0) {
          const diffMs = Date.now() - new Date(lastPosted[0].scheduled_at).getTime();
          daysSinceLastPost = diffMs / (1000 * 60 * 60 * 24);
        } else {
          const createdAt = profile.created_at
            ? new Date(profile.created_at).getTime()
            : Date.now();
          daysSinceLastPost = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
        }

        const isInactive = daysSinceLastPost >= (config.inactivityThresholdDays || 3);
        const isQueueCritical = currentQueueCount < 3;

        let resurrectedPost = null;
        if (
          config.enabled &&
          (isInactive || isQueueCritical || config.emergencySurvivalMode)
        ) {
          resurrectedPost = await runAISurvivalRefill(
            userId,
            config.inactivityThresholdDays || 3,
            config.preserveHashtags !== false,
            adminClient,
            {
              aiFallbackBehavior: config.aiFallbackBehavior,
              maxSurvivalPostsPerWeek: config.maxSurvivalPostsPerWeek,
            }
          );
        }

        return {
          userId,
          publishedCount: publishedIds.length,
          publishedIds,
          refilled: !!resurrectedPost,
          queueCount: currentQueueCount,
        };
      })
    );

    const results = settledResults.map((res, idx) => {
      if (res.status === "fulfilled") {
        return res.value;
      } else {
        console.error(`Cron failure for user ${profiles[idx].id}:`, res.reason);
        return {
          userId: profiles[idx].id,
          error: res.reason?.message || "Execution failed",
        };
      }
    });

    return NextResponse.json(
      { success: true, processedCount: profiles.length, results },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Cron handler exception:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
