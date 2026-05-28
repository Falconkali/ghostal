"use client";

import { useState, useEffect, useRef } from "react";
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
import { mockGhostModeConfig } from "@/lib/mock-data";
import type { GhostModeConfig, SurvivalLog } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import IntegrationRequired from "@/components/dashboard/integration-required";
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
  const { instagramConnected, user } = useAuth();
  const [config, setConfig] = useState<GhostModeConfig>({ ...mockGhostModeConfig });
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  // Real-time Automation Engine State (from AutomationRunner broadcasts)
  const [engineResult, setEngineResult] = useState<AutomationRunResult | null>(null);
  const [isForceRunning, setIsForceRunning] = useState(false);
  const [forceRunResult, setForceRunResult] = useState<string | null>(null);

  // Survival Logs (live from DB)
  const [survivalLogs, setSurvivalLogs] = useState<SurvivalLog[]>([]);

  // Uptime ticker
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const uptimeStartRef = useRef<number>(Date.now());

  // Timer counters (seconds since last run)
  const [publisherSecsAgo, setPublisherSecsAgo] = useState(0);
  const [monitorSecsAgo, setMonitorSecsAgo] = useState(0);
  const [refillSecsAgo, setRefillSecsAgo] = useState(0);
  const lastRunAtRef = useRef<number | null>(null);

  // ──────────────────────────────────────────────
  // Load initial config + logs from Supabase
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("ghost_mode_config, created_at")
          .eq("id", user.id)
          .single();

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

        // Load most recent 10 survival logs
        await fetchLogs();
      } catch (err) {
        console.error("Error loading ghost mode config:", err);
      } finally {
        setIsConfigLoading(false);
      }
    };

    init();
  }, [user]);

  // ──────────────────────────────────────────────
  // Fetch recent survival logs
  // ──────────────────────────────────────────────
  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("survival_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(10);

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
  };

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

      // Refresh logs if something happened
      if (result.publishedCount > 0 || result.resurrectedPost) {
        fetchLogs();
      }
    };

    window.addEventListener("automation_run", handleAutomationRun);
    return () => window.removeEventListener("automation_run", handleAutomationRun);
  }, [user]);

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

    try {
      await supabase
        .from("profiles")
        .update({ ghost_mode_config: updated })
        .eq("id", user.id);
    } catch (err) {
      console.error("Failed to save ghost mode config:", err);
    }
  };

  // ──────────────────────────────────────────────
  // Force-trigger automation cycle manually
  // ──────────────────────────────────────────────
  const handleForceRun = async () => {
    if (!user || isForceRunning) return;
    setIsForceRunning(true);
    setForceRunResult(null);

    try {
      // Import lazily to avoid circular issues
      const { checkAndPublishDuePosts, runAISurvivalRefill } = await import(
        "@/lib/automation"
      );

      const publishedIds = await checkAndPublishDuePosts(user.id);

      let resurrectedPost = null;
      if (config.enabled) {
        resurrectedPost = await runAISurvivalRefill(
          user.id,
          config.inactivityThresholdDays,
          config.preserveHashtags
        );
      }

      // Write a manual trigger log
      await supabase.from("survival_logs").insert({
        user_id: user.id,
        action: "Manual Trigger",
        description: `Manual automation cycle: ${publishedIds.length} post${
          publishedIds.length !== 1 ? "s" : ""
        } published, ${resurrectedPost ? "1 content resurrected" : "no resurrection needed"}.`,
        status: "success",
      });

      if (publishedIds.length > 0 || resurrectedPost) {
        setForceRunResult(
          `✓ Cycle complete: ${publishedIds.length} published${
            resurrectedPost ? ", 1 resurrected" : ""
          }`
        );
      } else {
        setForceRunResult("✓ Cycle complete: everything healthy, nothing to do");
      }

      await fetchLogs();
      setPublisherSecsAgo(0);
      setMonitorSecsAgo(0);
      setRefillSecsAgo(0);
      lastRunAtRef.current = Date.now();
    } catch (err: any) {
      console.error("Force run error:", err);
      setForceRunResult(`✗ Error: ${err.message || "Unknown error"}`);
    } finally {
      setIsForceRunning(false);
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
                <p className="text-xs text-zinc-400">
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
              <h2 className="text-lg font-bold text-white tracking-tight">
                Automation Engine
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>
                  Running • uptime {formatUptime(uptimeSeconds)} • {totalRuns} log entries
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
                      <span className="text-[10px] text-zinc-500 font-normal">Every 15s</span>
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
                      <span className="text-[10px] text-zinc-500 font-normal">Every 15s</span>
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
                  width: `${Math.min((engineResult.queueCount / 10) * 100, 100)}%`,
                }}
                transition={{ duration: 0.6 }}
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  engineResult.queueCount < 3
                    ? "from-red-500 to-orange-500"
                    : engineResult.queueCount < 6
                    ? "from-amber-500 to-yellow-500"
                    : "from-emerald-500 to-cyan-500"
                )}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
              <span>0</span>
              <span className={cn(
                "font-medium",
                engineResult.queueCount < 3 ? "text-red-400" : engineResult.queueCount < 6 ? "text-amber-400" : "text-emerald-400"
              )}>
                {engineResult.queueCount < 3 ? "⚠ Critical" : engineResult.queueCount < 6 ? "Low" : "Healthy"}
              </span>
              <span>10+</span>
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
              <h3 className="text-sm font-semibold text-white">Inactivity Threshold</h3>
              <p className="text-xs text-zinc-500">Days before activation</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-white">
                {config.inactivityThresholdDays}
              </span>
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
              <h3 className="text-sm font-semibold text-white">Emergency Survival</h3>
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
              <h3 className="text-sm font-semibold text-white">AI Fallback Behavior</h3>
              <p className="text-xs text-zinc-500">How AI responds</p>
            </div>
          </div>
          <div className="space-y-2">
            {(["repost_evergreen", "remix_captions", "full_ai"] as const).map(
              (behavior) => (
                <button
                  key={behavior}
                  onClick={() => updateConfig("aiFallbackBehavior", behavior)}
                  className={cn(
                    "w-full text-left rounded-lg px-3 py-2.5 text-xs font-medium border transition-all cursor-pointer",
                    config.aiFallbackBehavior === behavior
                      ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                      : "bg-white/[0.02] text-zinc-400 border-white/5 hover:bg-white/5"
                  )}
                >
                  {fallbackLabels[behavior]}
                </button>
              )
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
              <h3 className="text-sm font-semibold text-white">Max Survival Posts</h3>
              <p className="text-xs text-zinc-500">Per week limit</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-white">
                {config.maxSurvivalPostsPerWeek}
              </span>
              <span className="text-xs text-zinc-500">per week</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={config.maxSurvivalPostsPerWeek}
              onChange={(e) =>
                updateConfig("maxSurvivalPostsPerWeek", parseInt(e.target.value))
              }
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>1</span>
              <span>10</span>
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
              <h3 className="text-sm font-semibold text-white">Preserve Hashtags</h3>
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
              <h3 className="text-sm font-semibold text-white">Notify on Activation</h3>
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
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
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
          </div>
        )}
      </motion.div>

      {/* Workflow Diagram */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-lg font-bold text-white text-center">
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
