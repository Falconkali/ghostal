"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Calendar,
  Clock,
  Instagram,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Link2,
  RotateCcw,
  RefreshCw,
  Play,
  Layers,
  Image as ImageIcon,
  FileText,
  Ghost,
  Loader2,
  X,
  PartyPopper,
  Crown,
  PlusCircle,
  Bot,
  BarChart2,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Target,
  Database,
  ArrowUpRight,
} from "lucide-react";
import { cn, formatTitle } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import IntegrationRequired from "@/components/dashboard/integration-required";

import { remixCaption } from "@/lib/automation";
import type { SurvivalLog, AISuggestion, VaultItem } from "@/types";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  color = "#8b5cf6",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Track ring ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â uses currentColor so it adapts to light/dark */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.12}
        className="text-foreground"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" as const }}
      />
    </svg>
  );
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  reel: Play,
  image: ImageIcon,
  carousel: Layers,
  caption: FileText,
};

const suggestionTypeColors: Record<string, string> = {
  resurrect: "bg-cyan-500/10 text-cyan-400",
  remix: "bg-violet-500/10 text-violet-400",
  repost: "bg-emerald-500/10 text-emerald-400",
  new_content: "bg-amber-500/10 text-amber-400",
};

function formatStat(num: number): string {
  if (!num || isNaN(num)) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toLocaleString();
}

function DayMicroBars({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[4px] h-9 my-2.5">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-[2px] transition-all duration-500"
            style={{
              height: `${Math.max((v / max) * 26, v > 0 ? 4 : 2)}px`,
              backgroundColor: color,
              opacity: v > 0 ? 0.9 : 0.2,
            }}
          />
          <span className="text-[8px] font-mono text-muted-foreground/60 leading-none">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardContent() {
  const { instagramConnected, instagramHandle, user } = useAuth();
  const searchParams = useSearchParams();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomePlan, setWelcomePlan] = useState("");
  const [isFoundingMember, setIsFoundingMember] = useState(false);
  const handledWelcomeRef = useRef(false);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Metric Stats ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const [stats, setStats] = useState({
    momentum: 0,
    queueHealth: 0,
    queueLifespan: 0,
    streak: 0,
    risk: "low" as "low" | "medium" | "high" | "critical",
    postsThisWeek: 0,
    totalVaultItems: 0,
    survivalActivations: 0,
  });

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Scheduled Posts ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ AI Suggestions (generated from vault) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Recent Survival Logs (as notifications) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const [recentLogs, setRecentLogs] = useState<SurvivalLog[]>([]);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Instagram stub account info ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const [igInfo, setIgInfo] = useState({
    followers: 0,
    following: 0,
    postsCount: 0,
    username: "",
    profilePictureUrl: "",
    error: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  // Load all dashboard data from Supabase
  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const loadDashboardData = async () => {
    if (!user || !instagramConnected) return;
    setIsLoading(true);

    try {
      const now = new Date();
      const nowStr = now.toISOString();

      // Week boundaries (MonÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Sun)
      const weekStart = new Date(now);
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(now.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 1. Vault count ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const { count: vaultCount } = await supabase
        .from("vault_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. Scheduled future posts ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const { data: futurePosts } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "scheduled")
        .gt("scheduled_at", nowStr)
        .order("scheduled_at", { ascending: true });

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3. Posts published this week ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const { count: weekPosted } = await supabase
        .from("scheduled_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["posted", "ghost_posted"])
        .gte("scheduled_at", weekStart.toISOString());

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 4. Total posted ever (for streak calc) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const { data: postedAll } = await supabase
        .from("scheduled_posts")
        .select("scheduled_at")
        .eq("user_id", user.id)
        .in("status", ["posted", "ghost_posted"])
        .order("scheduled_at", { ascending: false });

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 5. Survival activations count ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const { count: activations } = await supabase
        .from("survival_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "Content Resurrected");

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 6. Next 4 upcoming posts ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const nextPosts = (futurePosts || []).slice(0, 4);

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 7. Recent survival logs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const { data: logData } = await supabase
        .from("survival_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(5);

      if (logData) {
        setRecentLogs(
          logData.map((d: any) => ({
            id: d.id,
            action: d.action,
            description: d.description || "",
            timestamp: d.timestamp,
            status: d.status as "success" | "warning" | "pending",
            postId: d.post_id || undefined,
          }))
        );
      }

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 8. Vault items for AI suggestions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const { data: vaultData } = await supabase
        .from("vault_items")
        .select("*")
        .eq("user_id", user.id)
        .order("performance_score", { ascending: false });

      const vaultItems: VaultItem[] = (vaultData || []).map((d: any) => ({
        id: d.id,
        type: d.media_type as any,
        title: d.title || "Untitled",
        caption: d.default_caption || "",
        tags: d.tags || [],
        mediaUrl: d.media_url || undefined,
        thumbnailUrl: d.thumbnail_url || undefined,
        createdAt: d.created_at,
        usedCount: d.used_count || 0,
        performanceScore: d.performance_score || 80,
        isEvergreen: d.is_evergreen || false,
      }));

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 9. Compute streak from posted history ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      let streakDays = 0;
      if (postedAll && postedAll.length > 0) {
        const postedDates = new Set(
          postedAll.map((p: any) =>
            new Date(p.scheduled_at).toLocaleDateString("en-CA") // YYYY-MM-DD
          )
        );
        let checkDate = new Date(now);
        checkDate.setHours(0, 0, 0, 0);
        const MAX_STREAK_DAYS = 365; // safety upper bound
        while (streakDays < MAX_STREAK_DAYS) {
          const key = checkDate.toLocaleDateString("en-CA");
          if (postedDates.has(key)) {
            streakDays++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 10. Compute metrics ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      const futureCount = futurePosts?.length || 0;
      const queueHealth = Math.min(100, Math.round((futureCount / 7) * 100));

      let risk: "low" | "medium" | "high" | "critical" = "critical";
      if (futureCount >= 5) risk = "low";
      else if (futureCount >= 3) risk = "medium";
      else if (futureCount >= 1) risk = "high";

      // Momentum: weighted combo of streak, vault size, queue health
      const momentum = Math.min(
        100,
        Math.round(
          streakDays * 3 +
            (vaultCount || 0) * 2 +
            queueHealth * 0.3 +
            (weekPosted || 0) * 5
        )
      );

      setStats({
        momentum: Math.max(momentum, 10),
        queueHealth,
        queueLifespan: futureCount,
        streak: streakDays,
        risk,
        postsThisWeek: weekPosted || 0,
        totalVaultItems: vaultCount || 0,
        survivalActivations: activations || 0,
      });

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 11. Scheduled posts list ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      setScheduledPosts(
        nextPosts.map((p: any) => ({
          id: p.id,
          caption: p.caption || "No Caption",
          scheduledAt: p.scheduled_at,
          status: p.status,
          type: p.type || "image",
        }))
      );

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 12. Generate AI suggestions from vault ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      generateSuggestions(vaultItems);

      // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 13. Real IG account stats via server-side API ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
      try {
        const statsRes = await fetch(`/api/instagram/stats?userId=${user.id}&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setIgInfo({
            followers: statsData.followers ?? 0,
            following: statsData.following ?? 0,
            postsCount: statsData.postsCount ?? 0,
            username: statsData.username || instagramHandle || "",
            profilePictureUrl: statsData.profilePictureUrl || user?.instagramProfilePictureUrl || user?.avatar || "",
            error: false,
          });
        } else {
          const errData = await statsRes.json().catch(() => ({}));
          console.warn("Instagram stats API error:", errData.error);
          setIgInfo({ followers: 0, following: 0, postsCount: 0, username: instagramHandle || "", profilePictureUrl: "", error: true });
        }
      } catch (err) {
        console.error("Error fetching Instagram stats:", err);
        setIgInfo({ followers: 0, following: 0, postsCount: 0, username: instagramHandle || "", profilePictureUrl: "", error: true });
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Generate AI suggestions from vault items ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const generateSuggestions = (items: VaultItem[]) => {
    if (items.length === 0) {
      setSuggestions([
        {
          id: "sug_empty_1",
          type: "new_content",
          title: "Upload Your First Asset",
          description:
            "Add content to your vault to get personalized AI resurrection and remix suggestions.",
          confidence: 90,
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    const generated: AISuggestion[] = [];

    // Best performer ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ resurrect
    const top = [...items].sort(
      (a, b) => b.performanceScore - a.performanceScore
    )[0];
    generated.push({
      id: `sug_res_${top.id}`,
      type: "resurrect",
      title: `Resurrect: ${formatTitle(top.title)}`,
      description: `This asset has a ${top.performanceScore}% performance score and has been used ${top.usedCount} time${top.usedCount !== 1 ? "s" : ""}. Ready for revival.`,
      confidence: 94,
      vaultItemId: top.id,
      suggestedCaption: remixCaption(top.caption, top.tags, true),
      createdAt: new Date().toISOString(),
    });

    // Most recent ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ remix
    const newest = [...items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    if (newest && newest.id !== top.id) {
      generated.push({
        id: `sug_rem_${newest.id}`,
        type: "remix",
        title: `Caption Remix: ${formatTitle(newest.title)}`,
        description: `AI has generated a fresh caption variation to re-engage your followers with a new hook and CTA.`,
        confidence: 87,
        vaultItemId: newest.id,
        suggestedCaption: remixCaption(newest.caption, newest.tags, true),
        createdAt: new Date().toISOString(),
      });
    }

    // Evergreen ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ repost
    const evergreen = items.find((i) => i.isEvergreen);
    if (evergreen) {
      generated.push({
        id: `sug_rep_${evergreen.id}`,
        type: "repost",
        title: `Repost: ${formatTitle(evergreen.title)}`,
        description: `Your follower base has grown. New audience members haven't seen this evergreen asset ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â republish it unmodified.`,
        confidence: 91,
        vaultItemId: evergreen.id,
        suggestedCaption: evergreen.caption,
        createdAt: new Date().toISOString(),
      });
    }

    setSuggestions(generated.slice(0, 3));
  };

  useEffect(() => {
    loadDashboardData();

    const handleAutomationRun = () => loadDashboardData();
    window.addEventListener("automation_run", handleAutomationRun);
    return () =>
      window.removeEventListener("automation_run", handleAutomationRun);
  }, [user?.id, instagramConnected]);

  // Handle ?welcome=subscription and ?welcome=founding_member params
  useEffect(() => {
    if (handledWelcomeRef.current) return;
    const welcomeParam = searchParams.get("welcome");
    const planParam = searchParams.get("plan") || "";
    if (welcomeParam === "subscription") {
      handledWelcomeRef.current = true;
      const planLabel =
        planParam === "creator_pro" ? "Creator Pro" :
        planParam === "survival_ai" ? "Survival AI" :
        planParam === "starter" ? "Starter" : "Pro";
      setWelcomePlan(planLabel);
      setIsFoundingMember(false);
      setShowWelcomeModal(true);
      window.history.replaceState({}, "", "/dashboard");
    } else if (welcomeParam === "founding_member") {
      handledWelcomeRef.current = true;
      setIsFoundingMember(true);
      setShowWelcomeModal(true);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  if (!instagramConnected) {
    return (
      <IntegrationRequired
        pageName="Dashboard Home"
        description="Verify analytics, schedule upcoming updates, monitor consistency scores, and check algorithm momentum alerts by linking your Instagram account."
      />
    );
  }

  const riskColors = {
    low: "text-emerald-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    critical: "text-red-400",
  };

  const riskBg = {
    low: "bg-emerald-500/10",
    medium: "bg-amber-500/10",
    high: "bg-orange-500/10",
    critical: "bg-red-500/10",
  };

  return (
    <>
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Welcome Modal Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowWelcomeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`relative w-full max-w-md rounded-2xl border p-8 text-center shadow-2xl ${
                isFoundingMember
                  ? "border-amber-500/30 bg-[#0f0f1a] shadow-amber-500/10"
                  : "border-violet-500/20 bg-[#0f0f1a] shadow-violet-500/10"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {isFoundingMember ? (
                <>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Founding Member #<span className="text-white">Ã¢Ë†Å¾</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-foreground">
                    Welcome to Ghostal Ã¢â‚¬â€ Forever! Ã°Å¸â€˜â€˜
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    You&apos;re a Founding Member. You&apos;ve locked in lifetime access at $99 Ã¢â‚¬â€ every feature, forever, with no monthly bills ever again.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      { icon: Ghost, label: "Ghost Mode", color: "text-cyan-400" },
                      { icon: Sparkles, label: "AI Survival", color: "text-violet-400" },
                      { icon: Zap, label: "Lifetime Access", color: "text-amber-400" },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                        <Icon className={`mx-auto h-5 w-5 ${color}`} />
                        <p className="mt-1.5 text-[10px] font-semibold text-zinc-300">{label}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white hover:brightness-110 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
                  >
                    Let&apos;s Build! Ã°Å¸Å¡â‚¬
                  </button>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/30">
                    <PartyPopper className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Welcome to Ghostal{welcomePlan ? ` ${welcomePlan}` : ""}! Ã°Å¸Å½â€°
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    {welcomePlan === "Starter"
                      ? "You're all set! Schedule posts, manage your 30-item vault, and track 7 days of analytics."
                      : welcomePlan === "Creator Pro"
                      ? "Ghost Mode, AI caption refinement, and 30-day analytics are now unlocked."
                      : welcomePlan === "Survival AI"
                      ? "Full backlog autopilot, evergreen recycler, and 90-day analytics are now active."
                      : `Your subscription is now active. You have full access to all ${welcomePlan || "plan"} features.`}
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {(welcomePlan === "Starter"
                      ? [
                          { icon: Calendar, label: "Scheduling", color: "text-blue-400" },
                          { icon: Database, label: "30 Vault Items", color: "text-emerald-400" },
                          { icon: BarChart2, label: "7-Day Analytics", color: "text-violet-400" },
                        ]
                      : welcomePlan === "Creator Pro"
                      ? [
                          { icon: Ghost, label: "Ghost Mode", color: "text-cyan-400" },
                          { icon: Sparkles, label: "AI Captions", color: "text-violet-400" },
                          { icon: BarChart2, label: "30-Day Analytics", color: "text-amber-400" },
                        ]
                      : [
                          { icon: Zap, label: "Full Autopilot", color: "text-amber-400" },
                          { icon: RotateCcw, label: "Evergreen Recycler", color: "text-emerald-400" },
                          { icon: BarChart2, label: "90-Day Analytics", color: "text-violet-400" },
                        ]
                    ).map(({ icon: Icon, label, color }) => (
                      <div key={label} className="rounded-xl border border-white/5 bg-white/5 p-3">
                        <Icon className={`mx-auto h-5 w-5 ${color}`} />
                        <p className="mt-1.5 text-[10px] font-semibold text-zinc-300">{label}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] cursor-pointer"
                  >
                    Let&apos;s Go! Ã°Å¸Å¡â‚¬
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Hero Section - Clean & Unboxed with Far-Right Refresh Button */}
        <motion.div variants={item} className="pt-2 pb-1 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center gap-2.5 flex-wrap">
              {getTimeGreeting()},{" "}
              <span className="gradient-text">
                {user?.name || "Creator"}
              </span>{" "}
              👋
            </h1>
            <p className="mt-2 text-base md:text-lg text-muted-foreground font-normal">
              Your Instagram is <span className="font-semibold text-emerald-400">protected</span>
            </p>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            title="Refresh dashboard data"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-foreground/[0.03] text-muted-foreground hover:text-foreground hover:bg-foreground/10 hover:border-violet-500/30 transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </button>
        </motion.div>

        {/* ═══ Stat Cards (Idea 2: 7-Day Micro Bar Charts) ════════════════════ */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Momentum */}
          <div className="glass-stat rounded-2xl p-5 border-t-2 border-t-violet-500/60 group relative overflow-hidden hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300">
            <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-all" />
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">Momentum</p>
                {isLoading ? (
                  <div className="mt-1 h-8 w-12 rounded bg-foreground/8 animate-pulse" />
                ) : (
                  <p className="mt-1 text-4xl font-black tracking-tight text-foreground tabular-nums">{stats.momentum}</p>
                )}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <DayMicroBars data={[2, 3, 4, 3, 2, 1, 0]} color="#8b5cf6" />
            <p className={cn("text-xs flex items-center gap-1.5 font-medium", stats.momentum >= 70 ? "text-emerald-400" : stats.momentum >= 40 ? "text-amber-400" : "text-red-400")}>
              <ArrowUpRight className="h-3 w-3" />
              {stats.momentum >= 70 ? "Strong consistency" : stats.momentum >= 40 ? "Building momentum" : "Needs attention"}
            </p>
          </div>

          {/* Queue Health */}
          <div className="glass-stat rounded-2xl p-5 border-t-2 border-t-cyan-500/60 group relative overflow-hidden hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300">
            <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">Queue Health</p>
                {isLoading ? (
                  <div className="mt-1 h-8 w-16 rounded bg-foreground/8 animate-pulse" />
                ) : (
                  <p className="mt-1 text-4xl font-black tracking-tight text-foreground tabular-nums">{stats.queueHealth}%</p>
                )}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <DayMicroBars data={[1, 1, 1, stats.queueLifespan >= 3 ? 1 : 0, stats.queueLifespan >= 5 ? 1 : 0, 0, 0]} color="#06b6d4" />
            <p className="text-xs text-cyan-400 flex items-center gap-1.5 font-medium">
              <Layers className="h-3 w-3" />
              {stats.queueLifespan} days of scheduled content
            </p>
          </div>

          {/* Streak */}
          <div className="glass-stat rounded-2xl p-5 border-t-2 border-t-amber-500/60 group relative overflow-hidden hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300">
            <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">Streak</p>
                {isLoading ? (
                  <div className="mt-1 h-8 w-10 rounded bg-foreground/8 animate-pulse" />
                ) : (
                  <p className="mt-1 text-4xl font-black tracking-tight text-foreground tabular-nums">{stats.streak}</p>
                )}
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <DayMicroBars data={[
              stats.streak >= 1 ? 1 : 0,
              stats.streak >= 2 ? 1 : 0,
              stats.streak >= 3 ? 1 : 0,
              stats.streak >= 4 ? 1 : 0,
              stats.streak >= 5 ? 1 : 0,
              stats.streak >= 6 ? 1 : 0,
              stats.streak >= 7 ? 1 : 0
            ]} color="#f59e0b" />
            <p className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
              <Zap className="h-3 w-3" />
              {stats.streak === 0 ? "Start posting today" : stats.streak === 1 ? "1 day streak" : `${stats.streak} day streak 🔥`}
            </p>
          </div>

          {/* Inactivity Risk */}
          <div className={cn(
            "glass-stat rounded-2xl p-5 border-t-2 group relative overflow-hidden transition-all duration-300",
            stats.risk === "low" ? "border-t-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]" : stats.risk === "medium" ? "border-t-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]" : "border-t-red-500/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          )}>
            <div className={cn("pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-60", riskBg[stats.risk])} />
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">Inactivity Risk</p>
                {isLoading ? (
                  <div className="mt-1 h-8 w-20 rounded bg-foreground/8 animate-pulse" />
                ) : (
                  <p className={cn("mt-1 text-3xl font-black tracking-tight capitalize tabular-nums", riskColors[stats.risk])}>
                    {stats.risk}
                  </p>
                )}
              </div>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", riskBg[stats.risk])}>
                <Shield className={cn("h-4 w-4", riskColors[stats.risk])} />
              </div>
            </div>
            <DayMicroBars data={[1, 1, stats.risk === "low" ? 1 : 0, 0, 0, 0, 0]} color={stats.risk === "low" ? "#10b981" : stats.risk === "medium" ? "#f59e0b" : "#ef4444"} />
            <p className={cn("text-xs flex items-center gap-1.5 font-medium", riskColors[stats.risk])}>
              <Shield className="h-3 w-3" />
              {stats.risk === "low" ? "You're well covered" : stats.risk === "medium" ? "Add posts soon" : stats.risk === "high" ? "Urgent: schedule now" : "Critical: ghost mode active"}
            </p>
          </div>
        </motion.div>

        {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Connected Account (IG Info) Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}


        {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Bottom Two Columns Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* AI Suggestions */}
          <motion.div variants={item} className="glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">AI Suggestions</h2>
                {!isLoading && suggestions.length > 0 && (
                  <span className="text-[10px] font-bold bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded-full">{suggestions.length}</span>
                )}
              </div>
              <Link
                href="/ai-survival"
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 hover:text-violet-400 transition-colors"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-foreground/5 animate-pulse" />
                ))
              ) : suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                  <Ghost className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Add content to your vault for suggestions</p>
                  <Link href="/vault" className="text-xs text-violet-400 hover:underline">Go to Vault â†’</Link>
                </div>
              ) : (
                suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="group/sug flex items-center gap-3 rounded-xl border border-border/50 bg-foreground/[0.02] p-3.5 hover:bg-violet-500/[0.04] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all duration-200 cursor-pointer"
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold uppercase",
                      suggestionTypeColors[sug.type] ? suggestionTypeColors[sug.type].replace("text-", "bg-").replace("/10", "/5") : "bg-foreground/5"
                    )}>
                      {sug.type === "resurrect" ? <RotateCcw className="h-4 w-4" /> : sug.type === "remix" ? <Sparkles className="h-4 w-4" /> : sug.type === "repost" ? <ArrowUpRight className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", suggestionTypeColors[sug.type] || "bg-foreground/10 text-foreground")}>
                          {sug.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">{sug.confidence}% match</span>
                      </div>
                      <p className="text-[13px] font-semibold text-foreground leading-snug">{sug.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed line-clamp-1">
                        {sug.description}
                      </p>
                    </div>
                    <Link
                      href="/ai-survival"
                      className="shrink-0 opacity-0 group-hover/sug:opacity-100 flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-violet-500"
                    >
                      Use <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Upcoming Queue + System Activity stacked */}
          <div className="flex flex-col gap-5">

            {/* Upcoming Queue */}
            <motion.div variants={item} className="glass rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <h2 className="text-sm font-semibold text-foreground">Upcoming Queue</h2>
                </div>
                <Link
                  href="/scheduler"
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-foreground/5 animate-pulse" />
                  ))
                ) : scheduledPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
                    <Calendar className="h-7 w-7 opacity-30" />
                    <p className="text-sm">No upcoming posts scheduled</p>
                    <Link href="/scheduler" className="text-xs text-violet-400 hover:underline">
                      Schedule your first post Ã¢â€ â€™
                    </Link>
                  </div>
                ) : (
                  scheduledPosts.map((post) => {
                    const TypeIcon = typeIcons[post.type] || ImageIcon;
                    const d = new Date(post.scheduledAt);
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-3 rounded-xl border border-border/40 bg-foreground/[0.02] px-3 py-2.5 hover:bg-foreground/5 transition-colors"
                      >
                        <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="flex-1 min-w-0 text-[13px] font-medium text-foreground truncate">
                          {post.caption}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                          {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* System Activity */}
            <motion.div variants={item} className="glass rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-foreground">System Activity</h2>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-xl bg-foreground/5 animate-pulse" />
                  ))
                ) : recentLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
                    <CheckCircle className="h-7 w-7 opacity-30" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  recentLogs.map((log, idx) => (
                    <div key={log.id} className="flex items-start gap-3 group/log">
                      <div className="relative mt-0.5 shrink-0">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          log.status === "success" ? "bg-emerald-400" : log.status === "warning" ? "bg-amber-400" : "bg-cyan-400"
                        )} />
                        {idx === 0 && (
                          <div className={cn(
                            "absolute inset-0 rounded-full animate-ping opacity-60",
                            log.status === "success" ? "bg-emerald-400" : log.status === "warning" ? "bg-amber-400" : "bg-cyan-400"
                          )} />
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-semibold text-white truncate text-[13px]">{log.action}</p>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">{log.description}</p>
                        <p className="text-[10px] text-zinc-500 pt-0.5">
                          {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}