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
  RefreshCw,
  X,
  Lock,
  Instagram,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePlan } from "@/hooks/use-plan";
import IntegrationRequired from "@/components/dashboard/integration-required";
import { supabase } from "@/lib/supabase";
// decrypt is only used server-side (see /api/instagram/stats/route.ts)
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

function formatStat(num: number): string {
  if (!num || isNaN(num)) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toLocaleString();
}

export default function AnalyticsPage() {
  const { instagramConnected, user } = useAuth();
  const { plan, limits } = usePlan();
  const maxDays = limits.analyticsDays;

  const [timePeriod, setTimePeriod] = useState<"week" | "month" | "quarter">("week");
  const [chartView, setChartView] = useState<"reach" | "followers">("reach");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Metrics States
  const [consistencyScore, setConsistencyScore] = useState(85);
  const [momentumStability, setMomentumStability] = useState(88);
  const [queueLifespanDays, setQueueLifespanDays] = useState(0);
  const [survivalActivations, setSurvivalActivations] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [topContent, setTopContent] = useState<any[]>([]);
  const [tagPerformance, setTagPerformance] = useState<{ tag: string; count: number; avgScore: number }[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{ title: string; description: string; plan: string; price: string } | null>(null);

  // Real Instagram account stats
  const [igStats, setIgStats] = useState<{ followers: number; following: number; mediaCount: number; handle: string } | null>(null);
  const [igMediaLoaded, setIgMediaLoaded] = useState(false);
  // Real per-day Instagram insights: { "YYYY-MM-DD": { reach, profileViews } }
  const [igInsights, setIgInsights] = useState<Record<string, { reach: number; profileViews: number }>>({});
  const [insightsAvailable, setInsightsAvailable] = useState(false);

  // Raw data for memoization
  const [rawData, setRawData] = useState<{ posts: any[], logs: any[], vault: any[], igMedia: any[], realFollowers: number }>({ posts: [], logs: [], vault: [], igMedia: [], realFollowers: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch raw data ONCE (or on manual sync)
  const fetchAnalyticsData = async (manualSync = false) => {
    if (!user) return;
    if (manualSync) setIsSyncing(true);
    else setIsLoading(true);
    
    try {
      // Fetch enough data for the largest allowed period
      const fetchDays = maxDays >= 90 ? 91 : maxDays >= 30 ? 31 : 8;
      const boundsDate = new Date();
      boundsDate.setDate(boundsDate.getDate() - fetchDays);

      const [
        { data: postsData },
        { data: logsData },
        { data: vaultData },
        { data: profileRow }
      ] = await Promise.all([
        supabase.from("scheduled_posts").select("*").eq("user_id", user.id).gte("scheduled_at", boundsDate.toISOString()),
        supabase.from("survival_logs").select("*").eq("user_id", user.id).gte("created_at", boundsDate.toISOString()),
        supabase.from("vault_items").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("instagram_handle").eq("id", user.id).single()
      ]);

      const posts = postsData || [];
      const logs = logsData || [];
      const vault = vaultData || [];
      
      let igMediaItems: any[] = [];
      let realFollowers = 0;
      let realMediaCount = 0;
      let realHandle = profileRow?.instagram_handle || "";

      // Client-side caching for Instagram API calls
      const cacheKeyStats = `ig_stats_v2_${user.id}`;
      const cacheKeyMedia = `ig_media_v2_${user.id}`;
      const now = Date.now();
      
      let cachedStats = null;
      let cachedMedia = null;
      
      if (!manualSync && typeof window !== "undefined") {
        try {
          const s = sessionStorage.getItem(cacheKeyStats);
          const m = sessionStorage.getItem(cacheKeyMedia);
          if (s) { const p = JSON.parse(s); if (now - p.timestamp < 300000) cachedStats = p.data; }
          if (m) { const p = JSON.parse(m); if (now - p.timestamp < 300000) cachedMedia = p.data; }
        } catch(e) {}
      }

      let realFollowing = 0;
      try {
        if (cachedStats) {
          realFollowers = cachedStats.followers ?? 0;
          realFollowing = cachedStats.following ?? 0;
          realMediaCount = cachedStats.postsCount ?? 0;
          realHandle = cachedStats.username || realHandle;
        } else {
          const statsRes = await fetch(`/api/instagram/stats`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            realFollowers = statsData.followers ?? 0;
            realFollowing = statsData.following ?? 0;
            realMediaCount = statsData.postsCount ?? 0;
            realHandle = statsData.username || realHandle;
            if (typeof window !== "undefined") sessionStorage.setItem(cacheKeyStats, JSON.stringify({ timestamp: now, data: statsData }));
          }
        }
        setIgStats({ followers: realFollowers, following: realFollowing, mediaCount: realMediaCount, handle: realHandle });

        if (cachedMedia) {
          igMediaItems = cachedMedia.items || [];
          if (igMediaItems.length > 0) setIgMediaLoaded(true);
        } else {
          const mediaRes = await fetch(`/api/instagram/media`);
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            if (mediaData.items && mediaData.items.length > 0) {
              igMediaItems = mediaData.items;
              setIgMediaLoaded(true);
              if (typeof window !== "undefined") sessionStorage.setItem(cacheKeyMedia, JSON.stringify({ timestamp: now, data: mediaData }));
            }
          }
        }
        // Fire-and-forget has been replaced by actually consuming insights data
        const cacheKeyInsights = `ig_insights_v1_${user.id}`;
        let insightsByDate: Record<string, { reach: number; profileViews: number }> = {};
        try {
          const cachedInsights = typeof window !== "undefined" ? sessionStorage.getItem(cacheKeyInsights) : null;
          if (!manualSync && cachedInsights) {
            const parsed = JSON.parse(cachedInsights);
            if (Date.now() - parsed.timestamp < 300000) insightsByDate = parsed.data;
          } else {
            const insightsRes = await fetch("/api/instagram/insights");
            if (insightsRes.ok) {
              const insightsJson = await insightsRes.json();
              if (insightsJson.available && insightsJson.byDate) {
                insightsByDate = insightsJson.byDate;
                if (typeof window !== "undefined") sessionStorage.setItem(cacheKeyInsights, JSON.stringify({ timestamp: Date.now(), data: insightsByDate }));
              }
            }
          }
        } catch (insightsErr) {
          console.warn("Instagram insights fetch error:", insightsErr);
        }
        const hasRealInsights = Object.keys(insightsByDate).length > 0;
        setIgInsights(insightsByDate);
        setInsightsAvailable(hasRealInsights);
      } catch (igErr) {
        console.warn("Instagram API error in analytics:", igErr);
      }

      setRawData({ posts, logs, vault, igMedia: igMediaItems, realFollowers });

    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const handleAutoRun = () => fetchAnalyticsData(true);
    window.addEventListener("automation_run", handleAutoRun);
    return () => window.removeEventListener("automation_run", handleAutoRun);
  }, [user]);

  // 2. Memoized calculations based on timePeriod and rawData
  useEffect(() => {
    if (isLoading || (rawData.posts.length === 0 && rawData.vault.length === 0)) return;
    
    const { posts, logs, vault, igMedia: igMediaItems, realFollowers } = rawData;
    
    // Calculate global metrics
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

    // Filter posts for chart bounds
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeksOfMonth = ["W1", "W2", "W3", "W4"];

    if (timePeriod === "week") {
      const synthesized: ChartDataPoint[] = daysOfWeek.map((day, idx) => {
        const dayOffset = idx - new Date().getDay() + 1;
        const targetDay = new Date();
        targetDay.setDate(targetDay.getDate() + dayOffset);

        const postsOnDay = posts.filter((p) => {
          const d = new Date(p.scheduled_at);
          return (
            d.getFullYear() === targetDay.getFullYear() &&
            d.getMonth() === targetDay.getMonth() &&
            d.getDate() === targetDay.getDate()
          );
        });

        const postCount = postsOnDay.length;
        let avgPerfScore = 75;
        if (postCount > 0) {
          const scores = postsOnDay.map((p) => {
            const vaultItem = vault.find((v) => v.id === p.vault_item_id);
            return vaultItem?.performance_score ?? 75;
          });
          avgPerfScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        }

        const igPostsOnDay = igMediaItems.filter((m) => {
          const d = new Date(m.timestamp);
          return (
            d.getFullYear() === targetDay.getFullYear() &&
            d.getMonth() === targetDay.getMonth() &&
            d.getDate() === targetDay.getDate()
          );
        });

        const currentFollowers = realFollowers || 0;
        const isFuture = targetDay.getTime() > Date.now();

        // Format targetDay as "YYYY-MM-DD" to look up real insights
        const dateKey = targetDay.toISOString().substring(0, 10);
        const realDayInsights = igInsights[dateKey] ?? null;

        let engagementRate = 0;
        let estimatedReach = 0;

        if (isFuture) {
          engagementRate = postCount > 0
            ? parseFloat((1.5 + (avgPerfScore / 100) * 5.0).toFixed(1))
            : 0;
          const baselineReach = Math.round(currentFollowers * 0.015);
          estimatedReach = postCount > 0
            ? baselineReach + Math.round(postsOnDay.map((p) => {
                const vaultItem = vault.find((v) => v.id === p.vault_item_id);
                const score = vaultItem?.performance_score ?? 75;
                return (currentFollowers * 0.12) * (score / 100);
              }).reduce((sum, r) => sum + r, 0))
            : 0;
        } else if (realDayInsights) {
          // ✅ Real Instagram Insights data
          estimatedReach = realDayInsights.reach;
          const totalEngagements = igPostsOnDay.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
          engagementRate = currentFollowers > 0
            ? parseFloat(((totalEngagements / currentFollowers) * 100).toFixed(1))
            : parseFloat(totalEngagements.toFixed(1));
        } else {
          if (igPostsOnDay.length > 0) {
            const totalEngagements = igPostsOnDay.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
            engagementRate = currentFollowers > 0
               ? parseFloat(((totalEngagements / currentFollowers) * 100).toFixed(1))
               : parseFloat(totalEngagements.toFixed(1));
            estimatedReach = totalEngagements > 0 ? totalEngagements * 10 : Math.round(currentFollowers * 0.015);
          } else {
             engagementRate = 0;
             estimatedReach = 0;
          }
        }

        return {
          date: day,
          posts: postCount,
          reach: estimatedReach,
          engagement: engagementRate,
          followers: currentFollowers > 0 ? currentFollowers : 0,
          newFollowers: Math.round(currentFollowers * 0.002) + postCount * 3,
          momentum: Math.min(100, 70 + postCount * 10),
        };
      });
      setChartData(synthesized);
    } else if (timePeriod === "month") {
      const synthesized: ChartDataPoint[] = weeksOfMonth.map((week, idx) => {
        const startDaysAgo = (4 - idx) * 7;
        const endDaysAgo = (3 - idx) * 7;

        const postsInWeek = posts.filter((p) => {
          const timeDiff = Date.now() - new Date(p.scheduled_at).getTime();
          const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
          return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
        });

        const postCount = postsInWeek.length;
        let avgPerfScore = 75;
        if (postCount > 0) {
          const scores = postsInWeek.map((p) => {
            const vaultItem = vault.find((v) => v.id === p.vault_item_id);
            return vaultItem?.performance_score ?? 75;
          });
          avgPerfScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        }

        const igPostsInWeek = igMediaItems.filter((m) => {
          const timeDiff = Date.now() - new Date(m.timestamp).getTime();
          const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
          return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
        });

        const currentFollowers = realFollowers || 0;
        const startDaysAgoForEng = (4 - idx) * 7;
        const isFuture = startDaysAgoForEng < 0; // If startDaysAgo is negative, it's future

        let engagementRate = 0;
        let estimatedReach = 0;

        if (isFuture) {
          engagementRate = postCount > 0
            ? parseFloat((1.8 + (avgPerfScore / 100) * 4.8).toFixed(1))
            : 0;
          const baselineReach = Math.round(currentFollowers * 0.05);
          estimatedReach = postCount > 0
            ? baselineReach + Math.round(postsInWeek.map((p) => {
                const vaultItem = vault.find((v) => v.id === p.vault_item_id);
                const score = vaultItem?.performance_score ?? 75;
                return (currentFollowers * 0.32) * (score / 100);
              }).reduce((sum, r) => sum + r, 0))
            : 0;
        } else {
          if (igPostsInWeek.length > 0) {
            const totalEngagements = igPostsInWeek.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
            engagementRate = currentFollowers > 0 
               ? parseFloat(((totalEngagements / currentFollowers) * 100).toFixed(1))
               : parseFloat(totalEngagements.toFixed(1));
            estimatedReach = totalEngagements > 0 ? totalEngagements * 10 : Math.round(currentFollowers * 0.05);
          } else {
             engagementRate = 0;
             estimatedReach = 0;
          }
        }

        return {
          date: week,
          posts: postCount,
          reach: estimatedReach,
          engagement: engagementRate,
          followers: currentFollowers > 0 ? currentFollowers : 0,
          newFollowers: Math.round(currentFollowers * 0.01) + postCount * 8,
          momentum: Math.min(100, 75 + postCount * 4),
        };
      });
      setChartData(synthesized);
    } else if (timePeriod === "quarter") {
      // 90-day view — 12 weekly buckets
      const synthesized: ChartDataPoint[] = Array.from({ length: 12 }, (_, idx) => {
        const weekLabel = `W${idx + 1}`;
        const startDaysAgo = (12 - idx) * 7;
        const endDaysAgo = (11 - idx) * 7;

        const postsInWeek = posts.filter((p) => {
          const timeDiff = Date.now() - new Date(p.scheduled_at).getTime();
          const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
          return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
        });

        const postCount = postsInWeek.length;
        let avgPerfScore = 75;
        if (postCount > 0) {
          const scores = postsInWeek.map((p) => {
            const vaultItem = vault.find((v) => v.id === p.vault_item_id);
            return vaultItem?.performance_score ?? 75;
          });
          avgPerfScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
        }

        const igPostsInWeek = igMediaItems.filter((m) => {
          const timeDiff = Date.now() - new Date(m.timestamp).getTime();
          const daysAgo = timeDiff / (1000 * 60 * 60 * 24);
          return daysAgo >= endDaysAgo && daysAgo < startDaysAgo;
        });

        const currentFollowers = realFollowers || 0;
        let engagementRate = 0;
        let estimatedReach = 0;

        if (igPostsInWeek.length > 0) {
          const totalEngagements = igPostsInWeek.reduce((sum, m) => sum + (m.like_count || 0) + (m.comments_count || 0), 0);
          engagementRate = currentFollowers > 0
            ? parseFloat(((totalEngagements / currentFollowers) * 100).toFixed(1))
            : parseFloat(totalEngagements.toFixed(1));
          estimatedReach = totalEngagements > 0 ? totalEngagements * 10 : Math.round(currentFollowers * 0.05);
        }

        return {
          date: weekLabel,
          posts: postCount,
          reach: estimatedReach,
          engagement: engagementRate,
          followers: currentFollowers > 0 ? currentFollowers : 0,
          newFollowers: Math.round(currentFollowers * 0.01) + postCount * 8,
          momentum: Math.min(100, 75 + postCount * 4),
        };
      });
      setChartData(synthesized);
    }
  }, [timePeriod, rawData, isLoading, igInsights]);


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
        ["Ghostal EXECUTIVE SYSTEM ANALYTICS SCORECARD"],
        [`Generated on: ${new Date().toLocaleString()}`],
        [`Account: @${user?.instagramHandle || "Ghostal_user"}`],
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
      link.setAttribute("download", `Ghostal_System_Report_${new Date().toISOString().split('T')[0]}.csv`);
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

      {/* Upgrade Plan Modal */}
      <AnimatePresence>
        {upgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setUpgradeModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm rounded-2xl bg-[#0f0f1a] border border-white/10 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setUpgradeModal(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <Lock className="h-5 w-5 text-amber-400" />
              </div>

              <h3 className="text-base font-bold text-foreground">{upgradeModal.title}</h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{upgradeModal.description}</p>

              <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Required Plan</p>
                  <p className="text-sm font-bold text-white">{upgradeModal.plan}</p>
                </div>
                <span className="text-lg font-bold text-violet-400">{upgradeModal.price}</span>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setUpgradeModal(null)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <a
                  href="/#pricing"
                  className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white text-center hover:bg-violet-500 transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                >
                  Upgrade Plan
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Momentum Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
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
              7 Days
            </button>
            <button
              onClick={() => {
                if (maxDays < 30) {
                  setUpgradeModal({
                    title: "30-Day Analytics Locked",
                    description: "Access 30 days of analytics history, weekly trend breakdowns, and engagement tracking. Available on the Creator Pro plan.",
                    plan: "Creator Pro",
                    price: "$29/mo",
                  });
                  return;
                }
                setTimePeriod("month");
              }}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                timePeriod === "month"
                  ? "bg-violet-600 text-white shadow"
                  : maxDays < 30
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              30 Days {maxDays < 30 && "🔒"}
            </button>
            <button
              onClick={() => {
                if (maxDays < 90) {
                  setUpgradeModal({
                    title: "90-Day Analytics Locked",
                    description: "Unlock 90 days of full analytics history with 12-week trend breakdowns and deep engagement data. Available on the Survival AI plan.",
                    plan: "Survival AI",
                    price: "$49/mo",
                  });
                  return;
                }
                setTimePeriod("quarter");
              }}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                timePeriod === "quarter"
                  ? "bg-violet-600 text-white shadow"
                  : maxDays < 90
                  ? "text-zinc-600 cursor-not-allowed"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              90 Days {maxDays < 90 && "🔒"}
            </button>
          </div>

          {/* Export Report & Sync Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAnalyticsData(true)}
              disabled={isSyncing}
              className="flex items-center justify-center rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white px-3 py-2 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin text-violet-400" : ""}`} />
            </button>
            <button
              onClick={exportAnalyticsReport}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-xs font-bold shadow-lg shadow-violet-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              Export Scorecard
            </button>
          </div>
        </div>
      </div>

      {/* Live Instagram Account Stats Banner */}
      {/* Option 2: Instagram Channel & Audience Overview Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-border/80 bg-gradient-to-r from-[#12111A] via-[#161426] to-[#0F0E1A] p-5 shadow-2xl relative overflow-hidden glow-violet"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Account Identity */}
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-xl">
              {user?.instagramProfilePictureUrl || user?.avatar ? (
                <img
                  src={user?.instagramProfilePictureUrl || user?.avatar}
                  alt={user?.instagramHandle || "Instagram"}
                  className="h-full w-full rounded-full object-cover bg-background"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900">
                  <Instagram className="h-6 w-6 text-pink-400" />
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  @{user?.instagramHandle || igStats?.handle || "connected_account"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-pink-400">
                  <Instagram className="h-3 w-3" />
                  Creator Account
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  ● Connected & Auto-Syncing
                </span>
                <span>•</span>
                <span>Real-time API Feed</span>
              </p>
            </div>
          </div>

          {/* Right: 4-Card Account Stat Grid */}
          <div className="grid grid-cols-3 gap-3 lg:w-auto w-full">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center min-w-[110px]">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Followers</p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {formatStat(rawData.realFollowers || igStats?.followers || 0)}
              </p>
              <span className="text-[10px] text-muted-foreground mt-0.5">Follows You</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center min-w-[110px]">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Following</p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {formatStat(igStats?.following || 0)}
              </p>
              <span className="text-[10px] text-muted-foreground mt-0.5">You Follow</span>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center min-w-[110px]">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Total Posts</p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {formatStat(igStats?.mediaCount || 0)}
              </p>
              <span className="text-[10px] text-violet-400 font-medium mt-0.5">Published</span>
            </div>
          </div>
        </div>
      </motion.div>

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
            <span className={`flex items-center text-xs font-medium ${consistencyScore >= 70 ? "text-emerald-400" : "text-red-400"}`}>
              {consistencyScore >= 70 ? <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" /> : <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
              {consistencyScore >= 70 ? `+${consistencyScore - 70}pts` : `${consistencyScore - 70}pts`}
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
            <span className={`flex items-center text-xs font-medium ${momentumStability >= 70 ? "text-emerald-400" : "text-red-400"}`}>
              {momentumStability >= 70 ? <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" /> : <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
              {momentumStability >= 70 ? `+${momentumStability - 70}pts` : `${momentumStability - 70}pts`}
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
              <h3 className="text-lg font-semibold text-foreground">
                {chartView === "reach" ? "Engagement & Reach" : "Live Followers"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {chartView === "reach"
                  ? insightsAvailable
                    ? "Real-time reach from Instagram Insights API · engagement from post activity."
                    : "Reach & engagement estimated from posting activity and vault performance scores."
                  : igStats
                    ? `Follower count from account connection · @${igStats.handle} · media count updated live`
                    : `Follower trajectory based on your posting activity.`
                }
              </p>
              {chartView === "reach" && insightsAvailable && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Live Instagram Data
                </span>
              )}
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
                {chartView === "reach" ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#12121a", borderColor: "#1e1e30", borderRadius: "12px", color: "#fff" }} />
                    <Area type="monotone" dataKey="reach" name="Total Reach" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                    <Area type="monotone" dataKey="engagement" name="Engagement Rate (%)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                  </AreaChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e30" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#12121a", borderColor: "#1e1e30", borderRadius: "12px", color: "#fff" }} />
                    <Area type="monotone" dataKey="followers" name="Followers" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorFollowers)" />
                    <Area type="monotone" dataKey="newFollowers" name="New Gained" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={0} />
                  </AreaChart>
                )}
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
            <h3 className="text-lg font-semibold text-foreground">Momentum Breakdown</h3>
            <p className="text-xs text-muted-foreground">
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
            <h3 className="text-lg font-semibold text-foreground">Top Performing Content</h3>
            <p className="text-xs text-muted-foreground">
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
              <h3 className="text-lg font-semibold text-foreground">Category Performance</h3>
              <p className="text-xs text-muted-foreground">
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
              Ghostal Algorithmic Index
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Chart & Recommendations Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Posts Volume Chart */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Posting Volume</h3>
            <p className="text-xs text-muted-foreground">
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
              <h3 className="text-lg font-semibold text-foreground">AI Health Recommendations</h3>
              <p className="text-xs text-muted-foreground">
                Actionable tips compiled from your latest account metadata.
              </p>
            </div>

            <div className="space-y-3">
              {topContent.length < 3 ? (
                <div className="flex gap-3 rounded-xl bg-violet-600/5 border border-violet-500/10 p-3.5">
                  <Sparkles className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Vault Health: Refill Recommended</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Your vault has limited items. Uploading 3-4 new reels or images will refresh the remix pool and improve Ghost Mode variety.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 rounded-xl bg-violet-600/5 border border-violet-500/10 p-3.5">
                  <Sparkles className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Vault Health: Healthy</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      You have sufficient content in your vault for the AI to remix. Top performers are being successfully prioritized.
                    </p>
                  </div>
                </div>
              )}

              {consistencyScore > 80 ? (
                <div className="flex gap-3 rounded-xl bg-cyan-600/5 border border-cyan-500/10 p-3.5">
                  <Activity className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Optimal Posting Frequency Protected</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Survival queue successfully bridged any burnout windows. Consistency score remains in the green zone.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 rounded-xl bg-cyan-600/5 border border-cyan-500/10 p-3.5">
                  <Activity className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Consistency Dropping</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Your posting consistency has dipped recently. Consider scheduling more posts or enabling AI Survival.
                    </p>
                  </div>
                </div>
              )}

              {queueLifespanDays <= 3 ? (
                <div className="flex gap-3 rounded-xl bg-amber-600/5 border border-amber-500/10 p-3.5">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Queue Expiry Alert</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Scheduled queue expires in {queueLifespanDays} days. AI recommends configuring Ghost Mode or adding manual posts.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 rounded-xl bg-emerald-600/5 border border-emerald-500/10 p-3.5">
                  <Clock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Queue Safe Buffer</h4>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      Scheduled queue has a safe buffer of {queueLifespanDays} days before exhaustion. You can safely step away.
                    </p>
                  </div>
                </div>
              )}
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
