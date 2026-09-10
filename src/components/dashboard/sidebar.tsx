"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Archive, Calendar, Ghost, Brain,
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut,
  Sparkles, Rocket, Users, HelpCircle, Crown, Zap,
  MessageSquare,
} from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { PLAN_LIMITS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Archive, Calendar, Ghost, Brain, BarChart3,
  Settings, MessageSquare, Rocket, Users,
};

const NAV_ITEM_COLORS: Record<string, string> = {
  "/dashboard": "text-violet-400 group-hover:text-violet-300",
  "/vault": "text-cyan-400 group-hover:text-cyan-300",
  "/scheduler": "text-blue-400 group-hover:text-blue-300",
  "/ghost-mode": "text-emerald-400 group-hover:text-emerald-300",
  "/ai-survival": "text-amber-400 group-hover:text-amber-300",
  "/upcoming": "text-pink-400 group-hover:text-pink-300",
  "/analytics": "text-indigo-400 group-hover:text-indigo-300",
  "/referrals": "text-rose-400 group-hover:text-rose-300",
  "/settings": "text-zinc-400 group-hover:text-zinc-300",
};

const NAV_ACTIVE_BG: Record<string, string> = {
  "/dashboard": "bg-violet-500/12 text-violet-300",
  "/vault": "bg-cyan-500/12 text-cyan-300",
  "/scheduler": "bg-blue-500/12 text-blue-300",
  "/ghost-mode": "bg-emerald-500/12 text-emerald-300",
  "/ai-survival": "bg-amber-500/12 text-amber-300",
  "/upcoming": "bg-pink-500/12 text-pink-300",
  "/analytics": "bg-indigo-500/12 text-indigo-300",
  "/referrals": "bg-rose-500/12 text-rose-300",
  "/settings": "bg-white/8 text-zinc-200",
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { instagramConnected, logout, user } = useAuth();

  const [ghostModeEnabled, setGhostModeEnabled] = useState(() => user?.ghostModeConfig?.enabled === true);

  useEffect(() => {
    if (user?.ghostModeConfig?.enabled !== undefined) {
      setGhostModeEnabled(user.ghostModeConfig.enabled === true);
    }
  }, [user?.ghostModeConfig?.enabled]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`sidebar-ghost-sync-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.new?.ghost_mode_config?.enabled !== undefined) {
            setGhostModeEnabled(payload.new.ghost_mode_config.enabled === true);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const isPro = user?.plan && user.plan !== "starter" && user.plan !== "free";

  const statusLabel = !instagramConnected
    ? "Integration Required"
    : ghostModeEnabled
    ? "Ghost Mode Active"
    : "Instagram Protected";

  const statusColor = !instagramConnected ? "amber" : ghostModeEnabled ? "emerald" : "sky";

  const planLabel = user?.plan === "creator_pro" ? "Creator Pro"
    : user?.plan === "survival_ai" ? "Survival AI"
    : user?.plan === "lifetime" ? "Lifetime"
    : "Starter";

  const vaultLimit = user?.plan ? (PLAN_LIMITS as any)[user.plan]?.vaultItems ?? 30 : 30;

  const renderContent = (forceExpand: boolean) => {
    const isCollapsed = forceExpand ? false : collapsed;

    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn("flex h-16 items-center border-b border-border px-4 shrink-0", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Image src="/logo.png" alt="Ghostal" width={36} height={36} className="object-contain rounded-xl" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-lg font-bold gradient-text">Ghostal</span>
                <p className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">
                  Content Autopilot
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">


          {DASHBOARD_NAV.map((navItem) => {
            const Icon = iconMap[navItem.icon];
            const isActive = pathname === navItem.href;
            const iconColor = NAV_ITEM_COLORS[navItem.href] || "text-muted-foreground";
            const activeBg = NAV_ACTIVE_BG[navItem.href] || "bg-foreground/10 text-foreground";

            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                onClick={onMobileClose}
                className={cn(
                  "group relative flex items-center rounded-lg transition-colors duration-150 cursor-pointer",
                  isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  isActive
                    ? cn(activeBg, "font-semibold")
                    : "hover:bg-foreground/[0.04] text-muted-foreground hover:text-foreground"
                )}
                title={isCollapsed ? navItem.label : undefined}
              >
                {Icon && (
                  <Icon className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? iconColor.split(" ")[0] : "text-muted-foreground group-hover:text-foreground"
                  )} />
                )}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn("overflow-hidden whitespace-nowrap text-[13px] font-medium flex-1")}
                    >
                      {navItem.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="nav-active-dot"
                    className={cn("h-1.5 w-1.5 rounded-full shrink-0",
                      iconColor.split(" ")[0].replace("text-", "bg-")
                    )}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card — only when not collapsed and not pro */}
        {!isCollapsed && !isPro && (
          <div className="mx-2.5 mb-2 rounded-xl bg-gradient-to-br from-violet-600/20 via-violet-500/10 to-cyan-600/10 border border-violet-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20">
                <Crown className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <span className="text-[12px] font-bold text-foreground">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              Unlock Ghost Mode, AI Survival, and {vaultLimit === Infinity ? "unlimited" : "100+"} vault items.
            </p>
            <Link href="/pricing"
              className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 py-2 text-[11px] font-bold text-white hover:brightness-110 transition-all hover:shadow-lg hover:shadow-violet-500/30">
              <Zap className="h-3 w-3" /> Upgrade Now
            </Link>
          </div>
        )}



        {/* Brand Moving Wave Ghost Mode Card */}
        <div className="mx-2.5 mb-2.5">
          {!isCollapsed ? (
            <Link
              href="/ghost-mode"
              className={cn(
                "relative group block overflow-hidden rounded-2xl p-3.5 transition-all duration-500",
                ghostModeEnabled
                  ? "border border-violet-400/40 shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:border-violet-300"
                  : "border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-400 opacity-70 hover:opacity-100"
              )}
            >
              {ghostModeEnabled ? (
                <>
                  {/* Dynamic Brand Aurora Moving Wave Background */}
                  <div className="pointer-events-none absolute inset-0 aurora-wave-bg opacity-90" />
                  <div className="pointer-events-none absolute -top-8 -left-8 h-28 w-44 rounded-full bg-violet-500/35 blur-2xl aurora-ribbon-1" />
                  <div className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-48 rounded-full bg-cyan-400/30 blur-2xl aurora-ribbon-2" />
                  <div className="pointer-events-none absolute top-1 right-2 h-20 w-24 rounded-full bg-purple-400/25 blur-xl animate-pulse" />

                  {/* Animated SVG Liquid Wave overlay */}
                  <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-25 mix-blend-overlay" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,30 Q25,55 50,30 T100,30 L100,100 L0,100 Z" fill="url(#brand-aurora-grad)">
                      <animate attributeName="d" dur="6s" repeatCount="indefinite"
                        values="M0,30 Q25,55 50,30 T100,100 L0,100 Z;
                                M0,45 Q25,20 50,45 T100,45 L100,100 L0,100 Z;
                                M0,30 Q25,55 50,30 T100,30 L100,100 L0,100 Z" />
                    </path>
                    <defs>
                      <linearGradient id="brand-aurora-grad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#c084fc" />
                      </linearGradient>
                    </defs>
                  </svg>
                </>
              ) : (
                <div className="pointer-events-none absolute inset-0 bg-zinc-900/40" />
              )}

              <div className="relative z-10 flex items-center gap-3">
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                  ghostModeEnabled
                    ? "bg-violet-500/25 border border-violet-300/40 text-violet-100 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                    : "bg-zinc-800/80 border border-zinc-700/50 text-zinc-500"
                )}>
                  <Ghost className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {ghostModeEnabled ? (
                      <>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa]" />
                      </>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-zinc-600 shrink-0" />
                    )}
                  </span>
                  <p className={cn(
                    "text-[13px] font-bold truncate leading-tight",
                    ghostModeEnabled ? "text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" : "text-zinc-400"
                  )}>
                    Ghost Mode {ghostModeEnabled ? "On" : "Off"}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/ghost-mode"
              title={ghostModeEnabled ? "Ghost Mode On" : "Ghost Mode Off"}
              className={cn(
                "relative group flex h-10 w-10 mx-auto items-center justify-center overflow-hidden rounded-xl transition-all hover:scale-105",
                ghostModeEnabled
                  ? "border border-violet-400/50 aurora-wave-bg text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.4)]"
                  : "border border-zinc-800 bg-zinc-900/80 text-zinc-500 opacity-70"
              )}
            >
              {ghostModeEnabled && (
                <div className="pointer-events-none absolute inset-0 bg-violet-400/25 blur-md animate-pulse" />
              )}
              <Ghost className="h-4 w-4 relative z-10" />
            </Link>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="border-t border-border px-2.5 py-2 space-y-0.5">
          {!isCollapsed && (
            <Link href="/settings"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors">
              <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              Help & Support
            </Link>
          )}
          <button
            onClick={onToggle}
            className="hidden md:flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center rounded-xl px-3 py-2 text-[12px] font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer",
              isCollapsed ? "justify-center" : "gap-2.5"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col glass-strong border-r border-border overflow-hidden transition-all duration-300",
        collapsed ? "sidebar-w-sm" : "sidebar-w"
      )}>
        {renderContent(false)}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -224 }} animate={{ x: 0 }} exit={{ x: -224 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-50 h-screen w-56 flex flex-col glass-strong border-r border-border md:hidden"
            >
              {renderContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
