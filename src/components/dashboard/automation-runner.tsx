"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkAndPublishDuePosts, runAISurvivalRefill } from "@/lib/automation";
import { supabase } from "@/lib/supabase";

export interface AutomationRunResult {
  publishedCount: number;
  resurrectedPost: any | null;
  queueCount: number;
  lastRunAt: string;
  engineStatus: {
    publisher: "ok" | "busy" | "error";
    monitor: "ok" | "warning" | "critical";
    refill: "ok" | "triggered" | "warning";
  };
  publisherMessage: string;
  monitorMessage: string;
  refillMessage: string;
}

// Broadcast automation results via CustomEvent so any component can listen
function broadcastResult(result: AutomationRunResult) {
  window.dispatchEvent(
    new CustomEvent<AutomationRunResult>("automation_run", { detail: result })
  );
}

export default function AutomationRunner() {
  const { user, instagramConnected } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!user || !instagramConnected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const runAutomationCycle = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        // 1. Fetch ghost mode config
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("ghost_mode_config, created_at")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching automation config:", error);
          isRunningRef.current = false;
          return;
        }

        const config = profile?.ghost_mode_config || {
          enabled: true,
          inactivityThresholdDays: 3,
          preserveHashtags: true,
          emergencySurvivalMode: false,
        };

        // 2. Publish due posts (always runs regardless of ghost mode)
        const publishedIds = await checkAndPublishDuePosts(user.id);

        // 3. Fetch current queue health
        const nowStr = new Date().toISOString();
        const { count: queueCount } = await supabase
          .from("scheduled_posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "scheduled")
          .gt("scheduled_at", nowStr);

        const currentQueueCount = queueCount || 0;

        // 4. Determine if user is inactive
        const { data: lastPosted } = await supabase
          .from("scheduled_posts")
          .select("scheduled_at")
          .eq("user_id", user.id)
          .in("status", ["posted", "ghost_posted"])
          .order("scheduled_at", { ascending: false })
          .limit(1);

        let daysSinceLastPost = 0;
        if (lastPosted && lastPosted.length > 0) {
          const diffMs = Date.now() - new Date(lastPosted[0].scheduled_at).getTime();
          daysSinceLastPost = diffMs / (1000 * 60 * 60 * 24);
        } else {
          const createdAt = profile?.created_at
            ? new Date(profile.created_at).getTime()
            : Date.now();
          daysSinceLastPost = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
        }

        const isInactive = daysSinceLastPost >= (config.inactivityThresholdDays || 3);
        const isQueueCritical = currentQueueCount < 3;

        // 5. Run AI survival refill if Ghost Mode enabled AND (inactive OR critical queue)
        let resurrectedPost = null;
        if (
          config.enabled &&
          (isInactive || isQueueCritical || config.emergencySurvivalMode)
        ) {
          resurrectedPost = await runAISurvivalRefill(
            user.id,
            config.inactivityThresholdDays || 3,
            config.preserveHashtags !== false
          );
        }

        // 6. Build human-readable status messages
        const publisherMessage =
          publishedIds.length > 0
            ? `Published ${publishedIds.length} post${publishedIds.length > 1 ? "s" : ""}`
            : "No posts due";

        const monitorMessage = isQueueCritical
          ? `\u26a0 Queue critical — only ${currentQueueCount} post${
              currentQueueCount !== 1 ? "s" : ""
            } remain`
          : isInactive
          ? `User inactive ${Math.floor(daysSinceLastPost)}d — Ghost Mode watching`
          : `Active — last post ${daysSinceLastPost.toFixed(1)} days ago, queue covers threshold`;

        const refillMessage = resurrectedPost
          ? `Resurrected content injected into queue`
          : currentQueueCount >= 3
          ? `Queue healthy — ${currentQueueCount} post${currentQueueCount !== 1 ? "s" : ""} scheduled`
          : `No vault content available for refill`;

        const result: AutomationRunResult = {
          publishedCount: publishedIds.length,
          resurrectedPost,
          queueCount: currentQueueCount,
          lastRunAt: new Date().toISOString(),
          engineStatus: {
            publisher: publishedIds.length > 0 ? "busy" : "ok",
            monitor: isQueueCritical ? "critical" : isInactive ? "warning" : "ok",
            refill: resurrectedPost ? "triggered" : isQueueCritical ? "warning" : "ok",
          },
          publisherMessage,
          monitorMessage,
          refillMessage,
        };

        broadcastResult(result);
      } catch (err) {
        console.error("Failed to run automation cycle:", err);
      } finally {
        isRunningRef.current = false;
      }
    };

    // Run immediately on mount
    runAutomationCycle();

    // Run every 5 minutes
    intervalRef.current = setInterval(runAutomationCycle, 300000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, instagramConnected]);

  return null; // Silent background runner — no UI rendered
}
