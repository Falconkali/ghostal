"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ghost,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  Brain,
  Archive,
  Sparkles,
  Hash,
  Bell,
  Activity,
  ChevronRight,
  Play,
  Pause,
  Cpu,
  RefreshCw,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GhostModeConfig, SurvivalLog } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import IntegrationRequired from "@/components/dashboard/integration-required";
import UpgradeWall from "@/components/dashboard/upgrade-wall";
import { supabase } from "@/lib/supabase";
import type { AutomationRunResult } from "@/components/dashboard/automation-runner";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const fallbackLabels: Record<GhostModeConfig["aiFallbackBehavior"], string> = {
  repost_evergreen: "Repost Evergreen Content",
  remix_captions: "Remix Captions with AI",
  full_ai: "Full AI Autopilot",
};

const workflowSteps = [
  {
    icon: Clock,
    title: "User Inactive",
    desc: "Inactivity detected",
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Queue Low",
    desc: "Queue health dropping",
    color: "from-red-500 to-pink-600",
    glow: "shadow-red-500/20",
  },
  {
    icon: Brain,
    title: "AI Activates",
    desc: "Ghost Mode engaged",
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
  },
  {
    icon: Archive,
    title: "Vault Content",
    desc: "Best content selected",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: Sparkles,
    title: "Captions Remixed",
    desc: "Fresh AI captions",
    color: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
  },
  {
    icon: Shield,
    title: "Momentum Safe",
    desc: "Account protected",
    color: "from-emerald-500 to-green-600",
    glow: "shadow-emerald-500/20",
  },
];

export default function GhostModePage() {
  const { instagramConnected, user, updateGhostModeConfig } = useAuth();
  const { plan, limits } = usePlan();

  // Default config — immediately overridden by user.ghostModeConfig from auth context
  const [config, setConfig] = useState<GhostModeConfig>(() => ({
    enabled: false,
    inactivityThresholdDays: 3,
    emergencySurvivalMode: false,
    aiFallbackBehavior: "remix_captions" as const,
    maxSurvivalPostsPerWeek: 5,
    preserveHashtags: true,
    notifyOnActivation: true,
  }));
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Real-time Automation Engine State (from AutomationRunner broadcasts)
  const [engineResult, setEngineResult] = useState<AutomationRunResult | null>(null);
  const [isForceRunning, setIsForceRunning] = useState(false);
  const [forceRunResult, setForceRunResult] = useState<string | null>(null);
  const [forceRunProgress, setForceRunProgress] = useState<string | null>(null);
  const [forceRunLogs, setForceRunLogs] = useState<string[]>([]);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Scroll force-run logs to the bottom
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [forceRunLogs]);


  // Survival Logs (live from DB)
  const [survivalLogs, setSurvivalLogs] = useState<SurvivalLog[]>([]);
  const [logsLimit, setLogsLimit] = useState(10);

  // Uptime ticker
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const uptimeStartRef = useRef<number>(Date.now());

  // Timer counters (seconds since last run)
  const [publisherSecsAgo, setPublisherSecsAgo] = useState(0);
  const [monitorSecsAgo, setMonitorSecsAgo] = useState(0);
  const [refillSecsAgo, setRefillSecsAgo] = useState(0);
  const lastRunAtRef = useRef<number | null>(null);

  // Hydrate config from auth context immediately (no extra DB round-trip)
  useEffect(() => {
    if (user?.ghostModeConfig) {
      setConfig(user.ghostModeConfig as GhostModeConfig);
    }
  }, [user?.ghostModeConfig]);

  // ──────────────────────────────────────────────
  // Load initial config + logs from Supabase (full refresh)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const init = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("ghost_mode_config, created_at")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("[GhostMode] Profile fetch error:", profileError);
        }

        if (profile?.ghost_mode_config) {
          setConfig(profile.ghost_mode_config as GhostModeConfig);
        }

        // Uptime from account creation
        if (profile?.created_at) {
          const diffSecs = Math.floor(
            (Date.now() - new Date(profile.created_at).getTime()) / 1000
          );
          uptimeStartRef.current = Date.now() - diffSecs * 1000;
          setUptimeSeconds(diffSecs);
        }

        await fetchLogs();
      } catch (err) {
        console.error("[GhostMode] Error loading config:", err);
      } finally {
        setIsConfigLoading(false);
      }
    };

    init();
  }, [user?.id]);

  // ──────────────────────────────────────────────
  // Fetch recent survival logs
  // ──────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("survival_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(logsLimit);

    if (data) {
      setSurvivalLogs(
        data.map((d: any) => ({
          id: d.id,
          action: d.action,
          description: d.description || "",
          timestamp: d.timestamp,
          status: d.status as "success" | "warning" | "pending",
          postId: d.post_id || undefined,
        }))
      );
    }
  }, [user, logsLimit]);

  // ──────────────────────────────────────────────
  // Listen to AutomationRunner broadcasts
  // ──────────────────────────────────────────────
  useEffect(() => {
    const handleAutomationRun = (e: Event) => {
      const result = (e as CustomEvent<AutomationRunResult>).detail;
      if (!result) return;
      setEngineResult(result);

      const now = Date.now();
      lastRunAtRef.current = now;
      setPublisherSecsAgo(0);
      setMonitorSecsAgo(0);
      setRefillSecsAgo(0);

      // Refresh logs and optionally notify if something happened
      if (result.publishedCount > 0 || result.resurrectedPost) {
        fetchLogs();
        if (config.notifyOnActivation && "Notification" in window) {
          Notification.requestPermission().then((perm) => {
            if (perm === "granted") {
              new Notification("Ghostal Automation", {
                body: `Ghost Mode active: ${result.publishedCount} post${
                  result.publishedCount !== 1 ? "s" : ""
                } published${result.resurrectedPost ? ", 1 content resurrected" : ""}.`,
                icon: "/favicon.ico",
              });
            }
          });
        }
      }
    };

    window.addEventListener("automation_run", handleAutomationRun);
    return () => window.removeEventListener("automation_run", handleAutomationRun);
  }, [config.notifyOnActivation, fetchLogs]);

  // ──────────────────────────────────────────────
  // Tick timers every second
  // ──────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds(
        Math.floor((Date.now() - uptimeStartRef.current) / 1000)
      );
      if (lastRunAtRef.current !== null) {
        const elapsed = Math.floor((Date.now() - lastRunAtRef.current) / 1000);
        setPublisherSecsAgo(elapsed);
        setMonitorSecsAgo(elapsed);
        setRefillSecsAgo(elapsed);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Supabase Realtime — auto-refresh logs when cron/background inserts a new survival_log
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`realtime-ghost-mode-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "survival_logs",
          filter: `user_id=eq.${user.id}`,
        },
        () => { fetchLogs(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchLogs]);

  // ──────────────────────────────────────────────
  // Formatters
  // ──────────────────────────────────────────────
  const formatAgo = (seconds: number) => {
    if (seconds < 0) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s ago`;
  };

  const formatUptime = (seconds: number) => {
    if (seconds < 0) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // ──────────────────────────────────────────────
  // Update ghost mode config in DB
  // ──────────────────────────────────────────────
  const updateConfig = async <K extends keyof GhostModeConfig>(
    key: K,
    value: GhostModeConfig[K]
  ) => {
    if (!user) return;
    const updated = { ...config, [key]: value };
    setConfig(updated);
    if (updateGhostModeConfig) {
      await updateGhostModeConfig(updated);
    }
  };

  // ──────────────────────────────────────────────
  // Force-trigger automation cycle manually
  // ──────────────────────────────────────────────
  const handleForceRun = async () => {
    if (!user || isForceRunning) return;
    setIsForceRunning(true);
    setForceRunResult(null);
    setForceRunProgress(null);
    setForceRunLogs([]);

    const time = () => new Date().toLocaleTimeString();
    const addLog = (msg: string) => {
      setForceRunLogs((prev) => [...prev, `[${time()}] ${msg}`]);
    };

    addLog("Initializing manual engine cycle...");
    addLog("Verifying Supabase connection and user session...");

    try {
      addLog("Dynamically importing automation module...");
      // Import lazily to avoid circular issues
      const { checkAndPublishDuePosts, runAISurvivalRefill } = await import(
        "@/lib/automation"
      );

      addLog("Starting Post Publisher check...");
      setForceRunProgress("Checking for due posts...");
      const publishedIds = await checkAndPublishDuePosts(
        user.id,
        supabase,
        (msg) => {
          setForceRunProgress(msg);
          addLog(`[Publisher] ${msg}`);
        }
      );

      addLog(`Post Publisher complete. Published ${publishedIds.length} post(s).`);

      let resurrectedPost = null;
      if (config.enabled) {
        addLog("Ghost Mode is ENABLED. Starting Ghost Monitor/Refill check...");
        setForceRunProgress("Checking queue health...");
        addLog("[Monitor] Checking scheduled queue health...");
        resurrectedPost = await runAISurvivalRefill(
          user.id,
          config.inactivityThresholdDays,
          config.preserveHashtags,
          supabase,
          {
            // If Emergency Survival Mode is ON, bypass the queue >= 3 gate
            forceRefill: config.emergencySurvivalMode,
            aiFallbackBehavior: config.aiFallbackBehavior,
            maxSurvivalPostsPerWeek: config.maxSurvivalPostsPerWeek,
          }
        );

        if (resurrectedPost) {
          addLog(`[Refill] ✓ Queue low! Resurrected post ID: ${resurrectedPost.id}`);
          addLog(`[Refill] Caption remixed using behavior: ${config.aiFallbackBehavior}`);
        } else {
          addLog("[Refill] Queue health is optimal or limit reached. No resurrection needed.");
        }
      } else {
        addLog("Ghost Mode is DISABLED. Skipping queue health and AI refill check.");
      }

      // Only write a log entry if something actually happened (prevents log spam)
      if (publishedIds.length > 0 || resurrectedPost) {
        addLog("Writing survival logs to database...");
        await supabase.from("survival_logs").insert({
          user_id: user.id,
          action: "Manual Trigger",
          description: `Manual cycle: ${publishedIds.length} post${
            publishedIds.length !== 1 ? "s" : ""
          } published, ${resurrectedPost ? "1 content resurrected" : "no resurrection needed"}.`,
          status: "success",
        });

        // Browser notification if user opted in
        if (config.notifyOnActivation && "Notification" in window) {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            new Notification("Ghostal Automation", {
              body: `${publishedIds.length} post${
                publishedIds.length !== 1 ? "s" : ""
              } published${resurrectedPost ? ", 1 content resurrected" : ""}.`,
              icon: "/favicon.ico",
            });
          }
        }
      }

      if (publishedIds.length > 0 || resurrectedPost) {
        const finalMsg = `✓ Cycle complete: ${publishedIds.length} published${
          resurrectedPost ? ", 1 resurrected" : ""
        }`;
        setForceRunResult(finalMsg);
        addLog(finalMsg);
      } else {
        const finalMsg = "✓ Cycle complete: everything healthy, nothing to do";
        setForceRunResult(finalMsg);
        addLog(finalMsg);
      }

      await fetchLogs();
      setPublisherSecsAgo(0);
      setMonitorSecsAgo(0);
      setRefillSecsAgo(0);
      lastRunAtRef.current = Date.now();
    } catch (err: any) {
      const errMsg = `✗ Error: ${err.message || "Unknown error"}`;
      console.error("Force run error:", err);
      setForceRunResult(errMsg);
      addLog(errMsg);
    } finally {
      setIsForceRunning(false);
      setForceRunProgress(null);
      addLog("Manual engine cycle execution thread ended.");
      setTimeout(() => setForceRunResult(null), 6000);
    }
  };

  if (!instagramConnected) {
    return (
      <IntegrationRequired
        pageName="Ghost Mode Control"
        description="Configure inactivity triggers, set max backup publication limits, customize caption remix behavior, and activate system defense protocols by connecting your Instagram account."
      />
    );
  }

  if (!limits.ghostMode) {
    return (
      <UpgradeWall
        feature="Ghost Mode"
        description="Ghost Mode automatically keeps your Instagram feed active when you go quiet. Upgrade to Creator Pro or higher to unlock this feature."
        requiredPlan="creator_pro"
        currentPlan={plan}
      />
    );
  }

  // Engine status helpers
  const publisherStatus = engineResult?.engineStatus.publisher ?? "ok";
  const monitorStatus = engineResult?.engineStatus.monitor ?? "ok";
  const refillStatus = engineResult?.engineStatus.refill ?? "ok";

  const statusDot = (status: string) => {
    if (status === "ok" || status === "busy") return "bg-emerald-500";
    if (status === "warning" || status === "triggered") return "bg-amber-500";
    if (status === "critical" || status === "error") return "bg-red-500";
    return "bg-zinc-500";
  };

  const statusLabel = (status: string) => {
    if (status === "ok") return { text: "ok", color: "text-emerald-400" };
    if (status === "busy") return { text: "busy", color: "text-blue-400" };
    if (status === "triggered") return { text: "triggered", color: "text-violet-400" };
    if (status === "warning") return { text: "warn", color: "text-amber-400" };
    if (status === "critical") return { text: "critical", color: "text-red-400" };
    return { text: "ok", color: "text-emerald-400" };
  };

  const totalRuns = survivalLogs.length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 relative"
    >
      {/* Animated Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" as const }}
          className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/[0.04] blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 60, -40, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" as const }}
          className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/[0.04] blur-[100px]"
        />
      </div>

      {/* Hero Section */}
      <motion.div
        variants={item}
        className="relative text-center py-8 md:py-12"
      >
        {/* Glow behind ghost */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]">
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity }}
            className={cn(
              "absolute inset-0 rounded-full blur-[80px]",
              config.enabled ? "bg-violet-600/20" : "bg-zinc-600/10"
            )}
          />
        </div>

        <motion.div
          animate={config.enabled ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
          className="relative inline-block"
        >
          <Ghost
            className={cn(
              "h-20 w-20 md:h-24 md:w-24 mx-auto transition-colors duration-500",
              config.enabled ? "text-violet-400" : "text-zinc-600"
            )}
          />
        </motion.div>

        <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold">
          <span
            className={cn(
              "transition-all duration-500",
              config.enabled ? "gradient-text glow-text" : "text-zinc-500"
            )}
          >
            Ghost Mode
          </span>
        </h1>
        <p className="mt-3 text-sm md:text-base text-zinc-400 max-w-md mx-auto">
          Your schedule backup safety net. If your scheduled queue runs empty, we auto-fill it with your vault backlog.
        </p>

        {/* Giant Toggle */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={() => updateConfig("enabled", !config.enabled)}
            className={cn(
              "relative w-24 h-12 rounded-full transition-all duration-500 focus:outline-none cursor-pointer",
              config.enabled
                ? "bg-violet-600 shadow-[0_0_40px_rgba(139,92,246,0.4)]"
                : "bg-zinc-700 shadow-none"
            )}
          >
            <motion.div
              animate={{ x: config.enabled ? 48 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "absolute left-1 top-1 h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                config.enabled ? "bg-white" : "bg-zinc-500"
              )}
            >
              {config.enabled ? (
                <Play className="h-4 w-4 text-violet-600 ml-0.5" />
              ) : (
                <Pause className="h-4 w-4 text-zinc-300" />
              )}
            </motion.div>
          </button>

          {/* Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={config.enabled ? "active" : "inactive"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {config.enabled ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">
                    Ghost Mode Active
                  </span>
                </>
              ) : (
                <>
                  <span className="h-3 w-3 rounded-full bg-zinc-600" />
                  <span className="text-sm font-semibold text-zinc-500">
                    Ghost Mode Inactive
                  </span>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Active Status Banner */}
      <AnimatePresence>
        {config.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-gradient-to-r from-violet-600/10 via-violet-500/5 to-cyan-600/10 border border-violet-500/20 p-4 flex items-center gap-3 glow-violet">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Ghost Mode is monitoring your queue
                </p>
                <p className="text-xs text-muted-foreground">
                  Autopilot will backfill queue slots from the vault if no posts are scheduled for {config.inactivityThresholdDays}{" "}
                  day{config.inactivityThresholdDays !== 1 ? "s" : ""}s
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          LIVE Automation Engine Panel
      ══════════════════════════════════════════ */}
      <motion.div
        variants={item}
        className="glass rounded-2xl p-6 border border-white/5 space-y-4 hover:border-violet-500/10 transition-all"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mr-3 shadow-[0_0_15px_rgba(16,185,129,0.1)] shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Automation Engine
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>
                  Running • {lastRunAtRef.current !== null ? `Next cycle in ${formatAgo(Math.max(0, 300 - (publisherSecsAgo % 300))).replace(" ago", "")} • ` : ""}uptime {formatUptime(uptimeSeconds)} • {totalRuns} log entries
                </span>
              </div>
            </div>
          </div>

          {/* Force Run Button */}
          <button
            onClick={handleForceRun}
            disabled={isForceRunning}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all border cursor-pointer",
              isForceRunning
                ? "bg-violet-600/10 border-violet-500/20 text-violet-400 opacity-70 cursor-not-allowed"
                : "bg-violet-600/10 border-violet-500/20 text-violet-400 hover:bg-violet-600/20 hover:border-violet-500/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.2)]"
            )}
          >
            {isForceRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Flame className="h-3.5 w-3.5" />
                Force Run
              </>
            )}
          </button>
        </div>

        {/* Force Run Progress Toast */}
        <AnimatePresence>
          {isForceRunning && forceRunProgress && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium border bg-violet-500/5 border-violet-500/10 text-violet-300"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              {forceRunProgress}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Force Run Result Toast */}
        <AnimatePresence>
          {forceRunResult && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold border",
                forceRunResult.startsWith("✓")
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}
            >
              {forceRunResult.startsWith("✓") ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              {forceRunResult}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive feedback logs terminal */}
        <AnimatePresence>
          {forceRunLogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-white/5 bg-[#09090e]/95 p-4 font-mono text-xs leading-relaxed shadow-inner">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500/60" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/60" />
                    <span className="h-2 w-2 rounded-full bg-green-500/60" />
                    <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider ml-1">
                      Engine Console Feedbacks
                    </span>
                  </div>
                  {isForceRunning ? (
                    <span className="flex items-center gap-1 text-[10px] text-violet-400">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      Streaming...
                    </span>
                  ) : (
                    <button
                      onClick={() => setForceRunLogs([])}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Clear Logs
                    </button>
                  )}
                </div>
                <div 
                  ref={logTerminalRef}
                  className="max-h-[160px] overflow-y-auto space-y-1 custom-scrollbar pr-1"
                >
                  {forceRunLogs.map((log, idx) => {
                    let colorClass = "text-zinc-400";
                    if (log.includes("[Publisher]")) colorClass = "text-emerald-400/90";
                    else if (log.includes("[Monitor]")) colorClass = "text-amber-400/90";
                    else if (log.includes("[Refill]")) colorClass = "text-violet-400/95";
                    else if (log.includes("✓")) colorClass = "text-emerald-400 font-medium";
                    else if (log.includes("✗")) colorClass = "text-red-400 font-medium";
                    
                    return (
                      <div key={idx} className={cn("whitespace-pre-wrap break-all px-2 py-1 rounded", idx % 2 === 0 ? "bg-white/[0.02]" : "", colorClass)}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Engine Sub-Process Rows */}
        <div className="space-y-3">
          {/* Post Publisher */}
          {(() => {
            const sl = statusLabel(publisherStatus);
            return (
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-[#12121a]/20 hover:bg-[#12121a]/40 hover:border-emerald-500/10 transition-all duration-300 group">
                <div className="flex items-center min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0C1A14] border border-emerald-500/20 text-emerald-400 mr-3.5 shadow-[0_0_10px_rgba(16,185,129,0.05)] group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">Post Publisher</span>
                      <span className="text-[10px] text-zinc-500 font-normal">Every 5m</span>
                    </div>
                    <span className="text-xs text-zinc-400 mt-1 truncate">
                      {engineResult?.publisherMessage ?? "Waiting for first cycle..."}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0 pl-4">
                  <span className={cn("text-xs font-semibold", sl.color)}>{sl.text}</span>
                  <span className="text-[10px] text-zinc-500">
                    {engineResult ? formatAgo(publisherSecsAgo) : "—"}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Ghost Monitor */}
          {(() => {
            const sl = statusLabel(monitorStatus);
            return (
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-[#12121a]/20 hover:bg-[#12121a]/40 hover:border-emerald-500/10 transition-all duration-300 group">
                <div className="flex items-center min-w-0">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border mr-3.5 group-hover:scale-105 transition-transform duration-300 shrink-0",
                      monitorStatus === "critical"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : monitorStatus === "warning"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-[#0C1A14] border-emerald-500/20 text-emerald-400"
                    )}
                  >
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">Ghost Monitor</span>
                      <span className="text-[10px] text-zinc-500 font-normal">Every 5m</span>
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-1 truncate",
                        monitorStatus === "critical"
                          ? "text-red-400"
                          : monitorStatus === "warning"
                          ? "text-amber-400"
                          : "text-zinc-400"
                      )}
                    >
                      {engineResult?.monitorMessage ?? "Waiting for first cycle..."}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0 pl-4">
                  <span className={cn("text-xs font-semibold", sl.color)}>{sl.text}</span>
                  <span className="text-[10px] text-zinc-500">
                    {engineResult ? formatAgo(monitorSecsAgo) : "—"}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Queue Refill */}
          {(() => {
            const sl = statusLabel(refillStatus);
            return (
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-[#12121a]/20 hover:bg-[#12121a]/40 hover:border-emerald-500/10 transition-all duration-300 group">
                <div className="flex items-center min-w-0">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border mr-3.5 group-hover:scale-105 transition-transform duration-300 shrink-0",
                      refillStatus === "triggered"
                        ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                        : refillStatus === "warning"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-[#0C1A14] border-emerald-500/20 text-emerald-400"
                    )}
                  >
                    <RefreshCw
                      className={cn(
                        "h-4 w-4",
                        refillStatus === "triggered" && "animate-spin"
                      )}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">Queue Refill</span>
                      <span className="text-[10px] text-zinc-500 font-normal">On demand</span>
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-1 truncate",
                        refillStatus === "triggered"
                          ? "text-violet-400"
                          : refillStatus === "warning"
                          ? "text-amber-400"
                          : "text-zinc-400"
                      )}
                    >
                      {engineResult?.refillMessage ?? "Waiting for first cycle..."}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0 pl-4">
                  <span className={cn("text-xs font-semibold", sl.color)}>{sl.text}</span>
                  <span className="text-[10px] text-zinc-500">
                    {engineResult ? formatAgo(refillSecsAgo) : "—"}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Queue health bar */}
        {engineResult && (
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-zinc-500 font-medium">Queue Health</span>
              <span className="text-[11px] text-zinc-400">
                {engineResult.queueCount} scheduled post{engineResult.queueCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min((engineResult.queueCount / 30) * 100, 100)}%`,
                }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  engineResult.queueCount < 3
                    ? "from-red-500 to-orange-500"
                    : engineResult.queueCount < 10
                    ? "from-amber-500 to-yellow-500"
                    : "from-emerald-500 to-cyan-500"
                )}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
              <span>0</span>
              <span className={cn(
                "font-medium",
                engineResult.queueCount < 3 ? "text-red-400" : engineResult.queueCount < 10 ? "text-amber-400" : "text-emerald-400"
              )}>
                {engineResult.queueCount < 3 ? "⚠ Critical" : engineResult.queueCount < 10 ? "Low" : "Healthy"}
              </span>
              <span>30+</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Configuration Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Inactivity Threshold */}
        <div className="glass rounded-xl p-5 hover:border-violet-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Inactivity Threshold</h3>
              <p className="text-xs text-zinc-500">Days before activation</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={config.inactivityThresholdDays}
                  onChange={(e) => updateConfig("inactivityThresholdDays", Math.max(1, Math.min(14, parseInt(e.target.value) || 1)))}
                  className="w-16 bg-transparent text-3xl font-bold text-white border-b-2 border-transparent focus:border-violet-500 focus:outline-none transition-colors p-0 text-center"
                />
              </div>
              <span className="text-xs text-zinc-500">days</span>
            </div>
            <input
              type="range"
              min={1}
              max={14}
              value={config.inactivityThresholdDays}
              onChange={(e) =>
                updateConfig("inactivityThresholdDays", parseInt(e.target.value))
              }
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-violet-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>1 day</span>
              <span>14 days</span>
            </div>
          </div>
        </div>

        {/* Emergency Survival Mode */}
        <div className="glass rounded-xl p-5 hover:border-violet-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Emergency Survival</h3>
              <p className="text-xs text-zinc-500">Extreme protection mode</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            Activates aggressive content preservation when momentum drops critically low.
          </p>
          <button
            onClick={() =>
              updateConfig("emergencySurvivalMode", !config.emergencySurvivalMode)
            }
            className={cn(
              "relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer",
              config.emergencySurvivalMode
                ? "bg-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "bg-zinc-700"
            )}
          >
            <motion.div
              animate={{ x: config.emergencySurvivalMode ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white"
            />
          </button>
        </div>

        {/* AI Fallback Behavior */}
        <div className="glass rounded-xl p-5 hover:border-violet-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Brain className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Fallback Behavior</h3>
              <p className="text-xs text-zinc-500">How AI responds</p>
            </div>
          </div>
          <div className="grid gap-2 mt-4">
            {(["repost_evergreen", "remix_captions", "full_ai"] as const).map(
              (behavior) => {
                const isSelected = config.aiFallbackBehavior === behavior;
                let title = "";
                let desc = "";
                if (behavior === "repost_evergreen") {
                  title = "Repost Evergreen";
                  desc = "Recycles your best performing older posts exactly as they were.";
                } else if (behavior === "remix_captions") {
                  title = "Remix Captions";
                  desc = "Recycles older media but generates fresh AI captions.";
                } else {
                  title = "Full AI";
                  desc = "Generates entirely new captions and imagery from scratch.";
                }
                
                return (
                  <button
                    key={behavior}
                    onClick={() => updateConfig("aiFallbackBehavior", behavior)}
                    className={cn(
                      "w-full text-left rounded-lg p-3 border transition-all cursor-pointer flex flex-col gap-1",
                      isSelected
                        ? "bg-violet-500/10 border-violet-500/40"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={cn("text-xs font-semibold", isSelected ? "text-violet-400" : "text-zinc-300")}>{title}</span>
                      <div className={cn("h-3 w-3 rounded-full border flex items-center justify-center", isSelected ? "border-violet-500" : "border-zinc-600")}>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500 leading-tight">{desc}</span>
                  </button>
                )
              }
            )}
          </div>
        </div>

        {/* Max Survival Posts */}
        <div className="glass rounded-xl p-5 hover:border-violet-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Max Survival Posts</h3>
              <p className="text-xs text-zinc-500">Per week limit</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={config.maxSurvivalPostsPerWeek}
                  onChange={(e) => updateConfig("maxSurvivalPostsPerWeek", Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  className="w-16 bg-transparent text-3xl font-bold text-white border-b-2 border-transparent focus:border-cyan-500 focus:outline-none transition-colors p-0 text-center"
                />
              </div>
              <span className="text-xs text-zinc-500">per week</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={config.maxSurvivalPostsPerWeek}
              onChange={(e) =>
                updateConfig("maxSurvivalPostsPerWeek", parseInt(e.target.value))
              }
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            />
              <div className="flex justify-between text-[10px] text-zinc-600">
              <span>1</span>
              <span>30</span>
            </div>
          </div>
        </div>

        {/* Preserve Hashtags */}
        <div className="glass rounded-xl p-5 hover:border-violet-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
              <Hash className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Preserve Hashtags</h3>
              <p className="text-xs text-zinc-500">Keep original hashtags</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            Maintain your original hashtag strategy on remixed and reposted content.
          </p>
          <button
            onClick={() => updateConfig("preserveHashtags", !config.preserveHashtags)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer",
              config.preserveHashtags
                ? "bg-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "bg-zinc-700"
            )}
          >
            <motion.div
              animate={{ x: config.preserveHashtags ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white"
            />
          </button>
        </div>

        {/* Notify on Activation */}
        <div className="glass rounded-xl p-5 hover:border-violet-500/20 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notify on Activation</h3>
              <p className="text-xs text-zinc-500">Alert when Ghost Mode acts</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-4">
            Receive notifications whenever Ghost Mode activates and takes action on your behalf.
          </p>
          <button
            onClick={() =>
              updateConfig("notifyOnActivation", !config.notifyOnActivation)
            }
            className={cn(
              "relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer",
              config.notifyOnActivation
                ? "bg-emerald-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                : "bg-zinc-700"
            )}
          >
            <motion.div
              animate={{ x: config.notifyOnActivation ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white"
            />
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          Live Survival Activity Log (inline)
      ══════════════════════════════════════════ */}
      <motion.div
        variants={item}
        className="glass rounded-2xl p-6 border border-white/5 hover:border-violet-500/10 transition-all"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            Recent Automation Activity
          </h2>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {isConfigLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
          </div>
        ) : survivalLogs.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Ghost className="h-10 w-10 text-zinc-700 mx-auto" />
            <p className="text-sm text-zinc-500">No automation activity yet.</p>
            <p className="text-xs text-zinc-600">
              Ghost Mode will start logging here once it runs.
            </p>
          </div>
        ) : (
          <div className="space-y-0 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
            {survivalLogs.map((log, i) => (
              <div key={log.id} className="flex gap-3 pb-4 last:pb-0">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      log.status === "success"
                        ? "bg-emerald-500/10"
                        : log.status === "warning"
                        ? "bg-amber-500/10"
                        : "bg-blue-500/10"
                    )}
                  >
                    {log.status === "success" ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    ) : log.status === "warning" ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                    )}
                  </div>
                  {i < survivalLogs.length - 1 && (
                    <div className="w-[1px] flex-1 bg-white/5 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-2 min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">{log.action}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    {log.description}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {new Date(log.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {survivalLogs.length >= logsLimit && (
              <div className="pt-2 pb-1 text-center">
                <button
                  onClick={() => setLogsLimit(prev => prev + 10)}
                  className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  Load More Activity
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Workflow Diagram */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-lg font-bold text-foreground text-center">
          How Ghost Mode Protects You
        </h2>
        <p className="text-sm text-zinc-400 text-center max-w-lg mx-auto">
          An automated pipeline that kicks in when you go silent
        </p>

        {/* Desktop Workflow - Horizontal */}
        <div className="hidden lg:flex items-center justify-center gap-0 py-8 overflow-x-auto">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15, duration: 0.4 }}
                  className={cn(
                    "flex flex-col items-center gap-3 rounded-xl border border-white/5 p-4 w-[150px] glass hover:border-white/10 transition-all cursor-default",
                    `shadow-lg ${step.glow}`
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br",
                      step.color
                    )}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">{step.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{step.desc}</p>
                  </div>
                </motion.div>

                {i < workflowSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: i * 0.15 + 0.1, duration: 0.3 }}
                    className="flex items-center px-1"
                  >
                    <div className="w-8 h-[2px] bg-gradient-to-r from-white/20 to-white/5" />
                    <ChevronRight className="h-4 w-4 text-white/20 -ml-1" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet Workflow - Vertical */}
        <div className="lg:hidden space-y-3 py-4">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border border-white/5 p-4 w-full max-w-sm glass",
                    `shadow-lg ${step.glow}`
                  )}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                      step.color
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-zinc-500">{step.desc}</p>
                  </div>
                </motion.div>
                {i < workflowSteps.length - 1 && (
                  <div className="h-6 w-[2px] bg-gradient-to-b from-white/10 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
