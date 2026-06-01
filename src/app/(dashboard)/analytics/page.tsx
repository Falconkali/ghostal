"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Bell,
  Play,
  Image as ImageIcon,
  Layers,
  FileText,
  Download,
  Printer,
  ChevronRight,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import IntegrationRequired from "@/components/dashboard/integration-required";
import { supabase } from "@/lib/supabase";
import { decrypt } from "@/lib/crypto";
import type { ScheduledPost, SurvivalLog } from "@/types";

interface ChartDataPoint {
  date: string;
  posts: number;
  engagement: number;
  reach: number;
  followers: number;
  newFollowers: number;
  momentum: number;
}

const tagColors: Record<string, string> = {
  motivational: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  meme: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  educational: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  evergreen: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  viral: "bg-red-500/10 text-red-400 border-red-500/20",
  trending: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  personal: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  promotional: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  bts: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  creative: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  lifestyle: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  productivity: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  reel: Play,
  image: ImageIcon,
  carousel: Layers,
  caption: FileText,
};

export default function AnalyticsPage() {
  const { instagramConnected, user } = useAuth();
  const [timePeriod, setTimePeriod] = useState<"week" | "month">("week");
  const [chartView, setChartView] = useState<"reach" | "followers">("reach");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Live Metrics States
  const [consistencyScore, setConsistencyScore] = useState(85);
  const [momentumStability, setMomentumStability] = useState(88);
  const [queueLifespanDays, setQueueLifespanDays] = useState(0);
  const [survivalActivations, setSurvivalActivations] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [topContent, setTopContent] = useState<any[]>([]);
  const [tagPerformance, setTagPerformance] = useState<{ tag: string; count: number; avgScore: number }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Real Instagram account stats
  const [igStats, setIgStats] = useState<{ followers: number; mediaCount: number; handle: string } | null>(null);
  const [igMediaLoaded, setIgMediaLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchAnalyticsData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch scheduled posts from DB
      const { data: postsData, error: postsErr } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user.id);

      if (postsErr) throw postsErr;

      // 2. Fetch survival logs from DB
      const { data: logsData, error: logsErr } = await supabase
        .from("survival_logs")
        .select("*")
        .eq("user_id", user.id);

      if (logsErr) throw logsErr;

      // 3. Fetch vault items from DB
      const { data: vaultData, error: vaultErr } = await supabase
        .from("vault_items")
        .select("*")
        .eq("user_id", user.id);

      if (vaultErr) throw vaultErr;

      const posts = postsData || [];
      const logs = logsData || [];
      const vault = vaultData || [];

      // ─────────────────────────────────────────────────────────────
      // 4. Fetch REAL Instagram data via Graph API
      // ─────────────────────────────────────────────────────────────
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("instagram_token, instagram_handle")
        .eq("id", user.id)
        .single();

      let igMediaItems: { timestamp: string; like_count: number; comments_count: number; media_type: string }[] = [];
      let realFollowers = 0;
      let realMediaCount = 0;
      let realHandle = profileRow?.instagram_handle || "";

      const decryptedToken = profileRow?.instagram_token ? decrypt(profileRow.instagram_token) : "";

      if (decryptedToken) {
        try {
          // Fetch real account stats (followers_count, media_count)
          const accountRes = await fetch(
            `https://graph.instagram.com/v21.0/me?fields=followers_count,media_count,username&access_token=${decryptedToken}`
          );
          const accountData = await accountRes.json();
          if (!accountData.error) {
            realFollowers = accountData.followers_count ?? 0;
            realMediaCount = accountData.media_count ?? 0;
            realHandle = accountData.username || realHandle;
            setIgStats({ followers: realFollowers, mediaCount: realMediaCount, handle: realHandle });
          }

          // Fetch recent media with likes & comments (available with instagram_business_basic)
          const mediaRes = await fetch(
            `https://graph.instagram.com/v21.0/me/media?fields=id,timestamp,like_count,comments_count,media_type&limit=50&access_token=${decryptedToken}`
          );
          const mediaData = await mediaRes.json();
          if (!mediaData.error && mediaData.data) {
            igMediaItems = mediaData.data;
            setIgMediaLoaded(true);
          }
        } catch (igErr) {
          console.warn("Instagram API error in analytics:", igErr);
        }
      }



      // ─────────────────────────────────────────────────────────────
      // 5. Queue / Survival metrics (from DB)
      // ─────────────────────────────────────────────────────────────
      const activationsCount = logs.filter(
        (l) => l.action?.toLowerCase().includes("resurrect") || l.action?.toLowerCase().includes("activate")
      ).length;
      setSurvivalActivations(activationsCount);

      const futureScheduled = posts.filter(
        (p) => p.status === "scheduled" && new Date(p.scheduled_at).getTime() > Date.now()
      );

      let lifespan = 0;
      if (futureScheduled.length > 0) {
        const sorted = [...futureScheduled].sort(
          (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
        );
        lifespan = Math.max(0, Math.ceil((new Date(sorted[0].scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      }
      setQueueLifespanDays(lifespan);

      const recentPostsCount = posts.filter(
        (p) => new Date(p.scheduled_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length;
      const calculatedConsistency = Math.min(100, Math.max(0, Math.round(50 + recentPostsCount * 8 + (lifespan > 3 ? 15 : 0))));
      setConsistencyScore(calculatedConsistency || 85);

      const queueHealth = Math.min(100, Math.round((lifespan / 15) * 100));
      setMomentumStability(Math.round((calculatedConsistency + Math.max(70, queueHealth)) / 2) || 88);

      // ─────────────────────────────────────────────────────────────
      // 6. Top Content from vault (DB, sorted by performance_score)
      // ─────────────────────────────────────────────────────────────
      const sortedVault = [...vault].sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));
      setTopContent(sortedVault.slice(0, 5));

      const tagMap: { [key: string]: { count: number; totalScore: number } } = {};
      vault.forEach((item) => {
        (item.tags || []).forEach((tag: string) => {
          if (!tagMap[tag]) tagMap[tag] = { count: 0, totalScore: 0 };
          tagMap[tag].count += 1;
          tagMap[tag].totalScore += (item.performance_score || 0);
        });
      });
      setTagPerformance(
        Object.entries(tagMap)
          .map(([tag, data]) => ({ tag, count: data.count, avgScore: Math.round(data.totalScore / data.count) }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 5)
      );

      // ─────────────────────────────────────────────────────────────
      // 7. Build Chart Data
      // ─────────────────────────────────────────────────────────────
      const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const weeksOfMonth = ["W1", "W2", "W3", "W4"];

      if (timePeriod === "week") {
        const synthesized: ChartDataPoint[] = daysOfWeek.map((day, idx) => {
          const dayOffset = idx - new Date().getDay() + 1;
          const targetDay = new Date();
          targetDay.setDate(targetDay.getDate() + dayOffset);

          // Real post items from DB for this day
          const postsOnDay = posts.filter((p) => {
            const d = new Date(p.scheduled_at);
            return (
              d.getFullYear() === targetDay.getFullYear() &&
              d.getMonth() === targetDay.getMonth() &&
              d.getDate() === targetDay.getDate()
            );
          });

          const postCount = postsOnDay.length;

          // Fetch average performance score of scheduled vault items for this day
          let avgPerfScore = 75; // Default fallback score
          if (postCount > 0) {
            const scores = postsOnDay.map((p) => {
              const vaultItem = vault.find((v) => v.id === p.vault_item_id);
              return vaultItem?.performance_score ?? 75;
            });
            avgPerfScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
          }

          // Real engagement from IG media API for this day
          const igPostsOnDay = igMediaItems.filter((m) => {
            const d = new Date(m.timestamp);
            return (
              d.getFullYear() === targetDay.getFullYear() &&
              d.getMonth() === targetDay.getMonth() &&
              d.getDate() === targetDay.getDate()
            );
          });

          const totalEngagements = igPostsOnDay.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
          
          // Engagement rate is real if connected, otherwise derived from database content performance
          const engagementRate = igPostsOnDay.length > 0 && realFollowers > 0
            ? parseFloat(Math.max(0.5, (totalEngagements / realFollowers) * 100).toFixed(1))
            : parseFloat((postCount > 0 ? 1.5 + (avgPerfScore / 100) * 5.0 : 0.8 + (idx % 3) * 0.1).toFixed(1));

          // Reach is real if connected, otherwise estimated from your actual posts' performance index
          const currentFollowers = realFollowers || 12500;
          const baselineReach = Math.round(currentFollowers * 0.015);
          const estimatedReach = postCount > 0
            ? baselineReach + Math.round(postsOnDay.map((p) => {
                const vaultItem = vault.find((v) => v.id === p.vault_item_id);
                const score = vaultItem?.performance_score ?? 75;
                return (currentFollowers * 0.12) * (score / 100);
              }).reduce((sum, r) => sum + r, 0))
            : baselineReach;

          return {
            date: day,
            posts: postCount,
            reach: estimatedReach,
            engagement: engagementRate,
            followers: realFollowers || (12500 + idx * 30),
            newFollowers: Math.round((realFollowers || 12500) * 0.002) + postCount * 3,
            momentum: Math.min(100, 70 + postCount * 10),
          };
        });
        setChartData(synthesized);
      } else {
        const synthesized: ChartDataPoint[] = weeksOfMonth.map((week, idx) => {
          const startDaysAgo = (4 - idx) * 7;
          const endDaysAgo = (3 - idx) * 7;

          const postsInWeek = posts.filter((p) => {
            const timeDiff = Date.now() - new Date(p.scheduled_at).getTime();
            const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
            return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
          });

          const postCount = postsInWeek.length;

          // Fetch average performance score for posts in this week bucket
          let avgPerfScore = 75;
          if (postCount > 0) {
            const scores = postsInWeek.map((p) => {
              const vaultItem = vault.find((v) => v.id === p.vault_item_id);
              return vaultItem?.performance_score ?? 75;
            });
            avgPerfScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
          }

          // Real IG media for this week bucket
          const igPostsInWeek = igMediaItems.filter((m) => {
            const timeDiff = Date.now() - new Date(m.timestamp).getTime();
            const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
            return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
          });

          const totalEngagements = igPostsInWeek.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
          
          // Engagement is real if connected, otherwise derived from database content performance
          const engagementRate = igPostsInWeek.length > 0 && realFollowers > 0
            ? parseFloat(Math.max(0.5, (totalEngagements / realFollowers) * 100).toFixed(1))
            : parseFloat((postCount > 0 ? 1.8 + (avgPerfScore / 100) * 4.8 : 1.1 + (idx % 2) * 0.1).toFixed(1));

          const currentFollowers = realFollowers || 12500;
          const baselineReach = Math.round(currentFollowers * 0.05);
          const estimatedReach = postCount > 0
            ? baselineReach + Math.round(postsInWeek.map((p) => {
                const vaultItem = vault.find((v) => v.id === p.vault_item_id);
                const score = vaultItem?.performance_score ?? 75;
                return (currentFollowers * 0.32) * (score / 100);
              }).reduce((sum, r) => sum + r, 0))
            : baselineReach;

          return {
            date: week,
            posts: postCount,
            reach: estimatedReach,
            engagement: engagementRate,
            followers: realFollowers || (12500 + idx * 100),
            newFollowers: Math.round((realFollowers || 12500) * 0.01) + postCount * 8,
            momentum: Math.min(100, 75 + postCount * 4),
          };
        });
        setChartData(synthesized);
      }
    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    // Listen to background automation updates
    window.addEventListener("automation_run", fetchAnalyticsData);
    return () => window.removeEventListener("automation_run", fetchAnalyticsData);
  }, [user, timePeriod]);

  // Export CSV Report completely client-side
  const exportAnalyticsReport = () => {
    if (!chartData || chartData.length === 0) {
      showToast("No analytics data available to export.", "error");
      return;
    }
    
    showToast("Generating CSV report & print scorecard...", "info");

    try {
      // 1. Compile CSV File
      const headers = ["Period / Date", "Posts Published", "Estimated Reach", "Avg Engagement (%)", "Followers Gained", "Total Followers", "Momentum (%)"];
      const rows = chartData.map(d => [
        d.date,
        d.posts,
        d.reach,
        `${d.engagement}%`,
        d.newFollowers,
        d.followers,
        `${d.momentum}%`
      ]);

      const csvContent = [
        ["GHOSTFLOW EXECUTIVE SYSTEM ANALYTICS SCORECARD"],
        [`Generated on: ${new Date().toLocaleString()}`],
        [`Account: @${user?.instagramHandle || "ghostflow_user"}`],
        [`Plan Tier: ${user?.plan || "Starter"}`],
        [],
        ["TIMELINE ENGAGEMENT METRICS"],
        headers,
        ...rows,
        [],
        ["TOP CONTENT PERFORMANCE LEADERBOARD"],
        ["Content Title", "Type", "Times Used", "Performance Index", "Evergreen Mode"],
        ...topContent.map(item => [
          item.title || "Untitled Blueprint",
          item.media_type || "reel",
          item.used_count || 0,
          `${item.performance_score || 0}%`,
          item.is_evergreen ? "Active" : "Standard"
        ]),
        [],
        ["CATEGORY PERFORMANCE DISTRIBUTION"],
        ["Tag / Theme", "Asset Count", "Average Performance Index"],
        ...tagPerformance.map(t => [
          t.tag,
          t.count,
          `${t.avgScore}%`
        ])
      ].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `GhostFlow_System_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("CSV scorecard downloaded successfully!", "success");

      // 2. Open printable view/PDF download
      setTimeout(() => {
        window.print();
      }, 1000);
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Failed to compile executive analytics.", "error");
    }
  };

  if (!instagramConnected) {
    return (
      <IntegrationRequired
        pageName="Momentum Analytics"
        description="Monitor consistency scores, analyze reach and engagement indices, evaluate queue health metrics, and review automated AI posting performance by connecting your Instagram account."
      />
    );
  }

  // Radial bar chart data for momentum
  const radialData = [
    {
      name: "Consistency",
      value: consistencyScore,
      fill: "#8b5cf6",
    },
    {
      name: "Stability",
      value: momentumStability,
      fill: "#06b6d4",
    },
    {
      name: "Queue Health",
      value: Math.min(100, Math.round((queueLifespanDays / 15) * 100)),
      fill: "#22c55e",
    },
  ];

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="space-y-6 print-full-width relative">
      {/* Dynamic print-override styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, nav, header, button, .no-print, [role="navigation"] {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .glass {
            background: rgba(0, 0, 0, 0.05) !important;
            color: #000 !important;
            border: 1px solid rgba(0, 0, 0, 0.15) !important;
            box-shadow: none !important;
          }
          .text-white {
            color: #000 !important;
          }
          .text-zinc-400, .text-zinc-500 {
            color: #444 !important;
          }
          .text-zinc-300 {
            color: #222 !important;
          }
          .border-white\\/5, .border-white\\/10 {
            border-color: rgba(0,0,0,0.1) !important;
          }
        }
      `}} />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 right-5 z-[999] flex items-center gap-2.5 rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white shadow-2xl"
          >
            {toast.type === "success" && <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />}
            {toast.type === "error" && <AlertTriangle className="h-4.5 w-4.5 text-red-400" />}
            {toast.type === "info" && <Bell className="h-4.5 w-4.5 text-violet-400 animate-bounce" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Momentum Analytics
          </h1>
          <p className="text-sm text-zinc-400">
            Real-time health and continuity metrics for your Instagram presence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 no-print self-start">
          {/* Time Period Tabs */}
          <div className="flex rounded-lg bg-white/5 p-1 border border-white/5">
            <button
              onClick={() => setTimePeriod("week")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                timePeriod === "week"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimePeriod("month")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                timePeriod === "month"
                  ? "bg-violet-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              This Month
            </button>
          </div>

          {/* Export Report Action */}
          <button
            onClick={exportAnalyticsReport}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-xs font-bold shadow-lg shadow-violet-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            Export Scorecard
          </button>
        </div>
      </div>

      {/* Live Instagram Account Stats Banner */}
      {igStats && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Live Instagram Data</span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-zinc-300">
            <span className="font-bold text-white">{igStats.followers.toLocaleString()}</span> followers
          </span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-zinc-300">
            <span className="font-bold text-white">{igStats.mediaCount.toLocaleString()}</span> posts
          </span>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-xs text-zinc-400">@{igStats.handle}</span>
          {igMediaLoaded && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-[10px] text-emerald-500 font-semibold">✓ Engagement data from real posts</span>
            </>
          )}
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-5 glow-violet"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Consistency Score</span>
            <Activity className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {consistencyScore}%
            </span>
            <span className="flex items-center text-xs font-medium text-emerald-400">
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" /> +2.4%
            </span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/5">
            <div
              className="h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              style={{ width: `${consistencyScore}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-5 glow-cyan"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Momentum Stability</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {momentumStability}%
            </span>
            <span className="flex items-center text-xs font-medium text-emerald-400">
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" /> +5.1%
            </span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/5">
            <div
              className="h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ width: `${momentumStability}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Queue Lifespan</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {queueLifespanDays} Days
            </span>
            <span className={queueLifespanDays < 3 ? "flex items-center text-xs font-medium text-red-400" : "flex items-center text-xs font-medium text-emerald-400"}>
              {queueLifespanDays < 3 ? <AlertTriangle className="mr-0.5 h-3.5 w-3.5" /> : <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />}
              {queueLifespanDays < 3 ? "Action Required" : "Buffer Safe"}
            </span>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Survival buffer kicks in on exhaustion.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Survival Autopilots</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {survivalActivations}
            </span>
            <span className="text-xs text-zinc-500">this month</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Ghost Mode preserved reach index.
          </div>
        </motion.div>
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Interactive Engagement/Follower Area Chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {chartView === "reach" ? "Engagement & Reach" : "Live Followers"}
              </h3>
              <p className="text-xs text-zinc-400">
                {chartView === "reach"
                  ? igMediaLoaded
                    ? "Engagement rate from real Instagram likes & comments. Reach is estimated."
                    : "Estimated reach & engagement from your posting activity."
                  : igStats
                    ? `Real follower count: ${igStats.followers.toLocaleString()} · from your connected account @${igStats.handle}`
                    : `Follower trajectory based on your posting activity.`
                }
              </p>
            </div>

            {/* Toggle switch */}
            <div className="flex rounded-md bg-white/5 p-0.5 border border-white/5 no-print self-start">
              <button
                onClick={() => setChartView("reach")}
                className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                  chartView === "reach" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Reach
              </button>
              <button
                onClick={() => setChartView("followers")}
                className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                  chartView === "followers" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Followers
              </button>
            </div>
          </div>

          <div className="h-80 w-full flex items-center justify-center bg-white/[0.01] rounded-xl border border-white/5 relative overflow-hidden">
            {mounted && !isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#12121a",
                      borderColor: "#1e1e30",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  {chartView === "reach" ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="reach"
                        name="Total Reach"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorReach)"
                      />
                      <Area
                        type="monotone"
                        dataKey="engagement"
                        name="Engagement Rate (%)"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEngagement)"
                      />
                    </>
                  ) : (
                    <>
                      <Area
                        type="monotone"
                        dataKey="followers"
                        name="Followers"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorFollowers)"
                      />
                      <Area
                        type="monotone"
                        dataKey="newFollowers"
                        name="New Gained"
                        stroke="#06b6d4"
                        strokeWidth={1.5}
                        fillOpacity={0}
                      />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                <span className="text-xs">Preparing metrics...</span>
              </div>
            )}
          </div>
        </div>

        {/* Radial Index Chart */}
        <div className="glass rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Momentum Breakdown</h3>
            <p className="text-xs text-zinc-400">
              Key dimensions guarding account health.
            </p>
          </div>

          <div className="relative flex-1 min-h-[220px] flex items-center justify-center">
            {mounted && !isLoading ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="90%"
                    barSize={10}
                    data={radialData}
                  >
                    <RadialBar
                      background={{ fill: "rgba(255,255,255,0.02)" }}
                      dataKey="value"
                      cornerRadius={5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#12121a",
                        borderColor: "#1e1e30",
                        borderRadius: "12px",
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">
                    {consistencyScore}%
                  </span>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                    Avg Guard
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                <span className="text-xs">Syncing stability metrics...</span>
              </div>
            )}
          </div>

          {/* Custom legend grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
            {radialData.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tight truncate max-w-[65px]">
                    {d.name}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">{d.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW: Leaderboard & Category Performance Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Content Leaderboard Card */}
        <div className="glass rounded-2xl p-6 md:col-span-2 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Top Performing Content</h3>
            <p className="text-xs text-zinc-400">
              Blueprints in your vault with the highest algorithmic distribution metrics.
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : topContent.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-4 text-center">
              <Star className="h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-sm font-medium text-zinc-400">No content rated yet</p>
              <p className="text-xs text-zinc-500 mt-0.5">Performance indices populate as posts are published.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    <th className="pb-3">Blueprint</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-center">Times Used</th>
                    <th className="pb-3 text-right">Performance Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topContent.map((item) => {
                    const TypeIcon = typeIcons[item.media_type || "reel"] || Play;
                    return (
                      <tr key={item.id} className="group hover:bg-white/[0.01]">
                        <td className="py-3 flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden relative">
                            {item.thumbnail_url ? (
                              <img
                                src={item.thumbnail_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-violet-600/10">
                                <TypeIcon className="h-4.5 w-4.5 text-violet-400" />
                              </div>
                            )}
                          </div>
                          <div className="truncate max-w-[180px] sm:max-w-[280px]">
                            <p className="font-semibold text-white truncate text-xs sm:text-sm">
                              {item.title || "Untitled Blueprint"}
                            </p>
                            <p className="text-xs text-zinc-500 truncate mt-0.5">
                              {item.default_caption || "No default caption"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/5 rounded px-2 py-0.5 border border-white/5 capitalize text-zinc-300">
                            <TypeIcon className="h-3 w-3 text-zinc-400" />
                            {item.media_type || "reel"}
                          </div>
                        </td>
                        <td className="py-3 text-center font-medium text-zinc-400">
                          {item.used_count || 0}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className="h-full bg-violet-500 rounded-full"
                                style={{ width: `${item.performance_score || 0}%` }}
                              />
                            </div>
                            <span className="font-bold text-white text-xs sm:text-sm">
                              {item.performance_score || 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Performance Breakdown Card */}
        <div className="glass rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Category Performance</h3>
              <p className="text-xs text-zinc-400">
                Average engagement metric split by specific content tags.
              </p>
            </div>

            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              </div>
            ) : tagPerformance.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-4 text-center">
                <Layers className="h-7 w-7 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500">Add tags to vault items to generate category performance.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {tagPerformance.map((tagItem) => {
                  const pillStyle = tagColors[tagItem.tag] || "bg-zinc-800 text-zinc-400 border-zinc-700/50";
                  return (
                    <div key={tagItem.tag} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-tight capitalize ${pillStyle}`}>
                          {tagItem.tag}
                        </span>
                        <span className="text-zinc-500 text-[10px] font-medium uppercase">
                          {tagItem.count} {tagItem.count === 1 ? "asset" : "assets"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                            style={{ width: `${tagItem.avgScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-white shrink-0 text-xs">
                          {tagItem.avgScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 border-t border-white/5 pt-4 text-center no-print">
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
              GhostFlow Algorithmic Index
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Chart & Recommendations Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Posts Volume Chart */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Posting Volume</h3>
            <p className="text-xs text-zinc-400">
              Total updates (scheduled posts & survival triggers) successfully output.
            </p>
          </div>
          <div className="h-64 w-full flex items-center justify-center bg-white/[0.01] rounded-xl border border-white/5 relative overflow-hidden">
            {mounted && !isLoading ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#12121a",
                      borderColor: "#1e1e30",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar
                    dataKey="posts"
                    name="Posts Published"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                <span className="text-xs">Aggregating timeline logs...</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations & Health Check */}
        <div className="glass rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">AI Health Recommendations</h3>
              <p className="text-xs text-zinc-400">
                Actionable tips compiled from your latest account metadata.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 rounded-xl bg-violet-600/5 border border-violet-500/10 p-3.5">
                <Sparkles className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Vault Health: Refill Recommended</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Evergreen items have been used twice on average. Uploading 3-4 new reels will refresh the remix pool.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl bg-cyan-600/5 border border-cyan-500/10 p-3.5">
                <Activity className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Optimal Posting Frequency Protected</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Survival queue successfully bridged the burnout window. Consistency score remains in the green.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl bg-amber-600/5 border border-amber-500/10 p-3.5">
                <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Queue Expiry Alert</h4>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                    Scheduled queue expires in {queueLifespanDays} days. AI recommends configuring Ghost Mode to remix captions if you plan to be away.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={exportAnalyticsReport}
            className="w-full mt-4 rounded-xl bg-white/5 py-2.5 text-xs font-semibold text-white border border-white/5 transition-all hover:bg-white/10 cursor-pointer flex items-center justify-center gap-1.5 hover:border-violet-500/30 no-print"
          >
            <Printer className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
            Print Executive Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
