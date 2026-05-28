import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { checkAndPublishDuePosts, runAISurvivalRefill } from "@/lib/automation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Verify auth header if CRON_SECRET is configured
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn("Cron Authorization failed: Secret mismatch.");
    return new Response("Unauthorized", { status: 401 });
  }

  const adminClient = createAdminClient();

  try {
    // 1. Fetch active profiles that have Instagram connected
    const { data: profiles, error: profileError } = await adminClient
      .from("profiles")
      .select("id, ghost_mode_config, created_at")
      .eq("instagram_connected", true);

    if (profileError) {
      console.error("Cron Error: Failed to fetch profiles:", profileError);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: "No active connected profiles found to process." }, { status: 200 });
    }

    const results = [];

    // 2. Loop over users and execute automation cycle
    for (const profile of profiles) {
      const userId = profile.id;
      const config = profile.ghost_mode_config || {
        enabled: true,
        inactivityThresholdDays: 3,
        preserveHashtags: true,
        emergencySurvivalMode: false,
      };

      // A. Check and publish due posts
      const publishedIds = await checkAndPublishDuePosts(userId, adminClient);

      // B. Run AI survival refill checks
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
          adminClient
        );
      }

      results.push({
        userId,
        publishedCount: publishedIds.length,
        publishedIds,
        refilled: !!resurrectedPost,
        queueCount: currentQueueCount,
      });
    }

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
