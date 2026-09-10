"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, Menu, User, LogOut, ChevronDown, Instagram,
  Calendar, Upload, Edit3, Sparkles, Command, X, CheckCircle2,
  AlertTriangle, Info, Zap, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TopbarProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

const QUICK_ACTIONS = [
  { label: "Schedule Post", icon: Calendar, href: "/scheduler", shortcut: "S", color: "text-violet-400" },
  { label: "Upload to Vault", icon: Upload, href: "/vault", shortcut: "U", color: "text-cyan-400" },
  { label: "Generate Caption", icon: Edit3, href: "/ai-survival", shortcut: "G", color: "text-emerald-400" },
  { label: "AI Rewrite", icon: Sparkles, href: "/ai-survival", shortcut: "R", color: "text-amber-400" },
];

const SEARCH_SUGGESTIONS = [
  { label: "Go to Scheduler", href: "/scheduler", icon: Calendar },
  { label: "Open Vault", href: "/vault", icon: Upload },
  { label: "Run AI Survival", href: "/ai-survival", icon: Sparkles },
  { label: "View Analytics", href: "/analytics", icon: Zap },
  { label: "Settings", href: "/settings", icon: User },
];

function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Topbar({ onMobileMenuToggle, sidebarCollapsed }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const [igStats, setIgStats] = useState<{
    followers: number; following: number; postsCount: number;
    username: string; profilePictureUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("Ghostal_notifications_checked");
      if (stored) setLastChecked(parseInt(stored, 10));
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("survival_logs").select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false }).limit(8);
      if (data && !error) setLogs(data);
    } catch {}
  }, [user]);

  const fetchIgStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/instagram/stats");
      if (res.ok) {
        const data = await res.json();
        setIgStats({
          followers: data.followers || 0, following: data.following || 0,
          postsCount: data.postsCount || 0,
          username: data.username || user.instagramHandle || "",
          profilePictureUrl: data.profilePictureUrl || user.instagramProfilePictureUrl || user.avatar,
        });
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchLogs(); fetchIgStats();
    const handler = () => { fetchLogs(); fetchIgStats(); };
    window.addEventListener("automation_run", handler);
    return () => window.removeEventListener("automation_run", handler);
  }, [fetchLogs, fetchIgStats]);

  // ⌘K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click-outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setSearchOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = logs.filter(l => new Date(l.timestamp).getTime() > lastChecked).length;

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen); setProfileOpen(false);
    if (!notifOpen) {
      const now = Date.now();
      setLastChecked(now);
      localStorage.setItem("Ghostal_notifications_checked", now.toString());
    }
  };

  const planLabel = user?.plan === "creator_pro" ? "Creator Pro"
    : user?.plan === "survival_ai" ? "Survival AI"
    : user?.plan === "lifetime" ? "Lifetime"
    : "Starter";

  const planColor = user?.plan === "lifetime" ? "from-amber-400 to-orange-500"
    : user?.plan === "survival_ai" ? "from-violet-400 to-cyan-500"
    : user?.plan === "creator_pro" ? "from-violet-400 to-violet-600"
    : "from-zinc-400 to-zinc-500";

  const igHandle = igStats?.username || user?.instagramHandle || "";
  const igAvatar = igStats?.profilePictureUrl || user?.instagramProfilePictureUrl || user?.avatar;
  const isConnected = user?.instagramConnected || Boolean(igHandle);

  const filteredSuggestions = searchQuery
    ? SEARCH_SUGGESTIONS.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : SEARCH_SUGGESTIONS;

  const getLogIcon = (status: string) => {
    if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    return <Info className="h-4 w-4 text-blue-400" />;
  };

  return (
    <>
      {/* ⌘K Command Palette Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm px-4"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          >
            <motion.div
              ref={searchRef}
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-lg rounded-2xl border border-violet-500/20 bg-[#0f0f1a] shadow-2xl shadow-violet-500/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search pages, actions..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-zinc-500 outline-none"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
                  <X className="h-2.5 w-2.5" /> ESC
                </button>
              </div>

              {/* Quick Actions */}
              {!searchQuery && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-600 mb-2">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map((action) => (
                      <Link key={action.label} href={action.href}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.07] hover:border-violet-500/20 transition-all group">
                        <action.icon className={cn("h-4 w-4 shrink-0", action.color)} />
                        <span className="text-xs font-medium text-foreground">{action.label}</span>
                        <span className="ml-auto text-[9px] font-bold bg-white/5 border border-white/8 rounded px-1 py-0.5 text-zinc-500">
                          {action.shortcut}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results / Navigation */}
              <div className="px-4 py-2 pb-3">
                {!searchQuery && <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-600 mb-2 mt-2">Navigate</p>}
                <div className="space-y-0.5">
                  {filteredSuggestions.map((item) => (
                    <Link key={item.label} href={item.href}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors group">
                      <item.icon className="h-4 w-4 text-zinc-500 group-hover:text-violet-400 transition-colors" />
                      <span className="text-sm text-zinc-300 group-hover:text-foreground transition-colors">{item.label}</span>
                      <ChevronDown className="ml-auto h-3 w-3 text-zinc-700 rotate-[-90deg] group-hover:text-zinc-500 transition-colors" />
                    </Link>
                  ))}
                  {searchQuery && filteredSuggestions.length === 0 && (
                    <p className="py-6 text-center text-sm text-zinc-500">No results for &quot;{searchQuery}&quot;</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 border-t border-white/5 bg-white/[0.015]">
                <span className="flex items-center gap-1 text-[10px] text-zinc-600"><Command className="h-2.5 w-2.5" />K to open</span>
                <span className="text-[10px] text-zinc-600">↑↓ to navigate</span>
                <span className="text-[10px] text-zinc-600">↵ to select</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Topbar */}
      <header className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center gap-3 border-b border-border px-4 md:px-5 glass left-0",
        sidebarCollapsed ? "md-left-sidebar-sm" : "md-left-sidebar"
      )}>
        {/* Mobile menu */}
        <button onClick={onMobileMenuToggle}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-foreground/5 text-muted-foreground transition-colors">
          <Menu className="h-5 w-5" />
        </button>

        {/* Search / Command Bar */}
        <div className="relative flex-1 max-w-xs">
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className={cn(
              "w-full flex items-center gap-2.5 rounded-xl border bg-foreground/[0.04] px-3 py-2 text-sm text-muted-foreground",
              "hover:border-violet-500/30 hover:bg-foreground/[0.07] transition-all duration-200 border-border cursor-pointer"
            )}
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:block flex-1 text-left text-[13px]">Search anything...</span>
            <span className="hidden sm:flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
              <Command className="h-2.5 w-2.5" />K
            </span>
          </button>
        </div>



        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button onClick={handleNotifClick}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-foreground/[0.07] hover:text-foreground">
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-[9px] font-bold text-white px-1 shadow-lg shadow-violet-500/40">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 rounded-2xl glass-strong border border-border shadow-2xl shadow-black/30 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-sm font-semibold text-foreground">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="py-10 px-4 text-center">
                        <Bell className="h-7 w-7 text-zinc-600 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No notifications yet</p>
                      </div>
                    ) : (
                      logs.map((log) => {
                        const isUnread = new Date(log.timestamp).getTime() > lastChecked;
                        return (
                          <div key={log.id} className={cn(
                            "flex gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors hover:bg-foreground/[0.04]",
                            isUnread && "bg-violet-500/[0.05]"
                          )}>
                            <div className="mt-0.5 shrink-0">{getLogIcon(log.status)}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[13px] font-semibold text-foreground leading-tight">{log.action}</p>
                                {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0 mt-1" />}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{log.description}</p>
                              <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {formatRelativeTime(log.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="border-t border-border px-4 py-2.5">
                    <Link href="/analytics" className="text-[11px] text-violet-400 hover:text-violet-300 font-medium transition-colors flex items-center gap-1">
                      View all activity <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all hover:bg-foreground/[0.07] cursor-pointer group border border-transparent hover:border-border/50"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/30" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white uppercase select-none ring-2 ring-violet-500/20">
                  {user?.name ? user.name.charAt(0) : "U"}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{user?.name?.split(" ")[0] || "User"}</p>
                <p className={cn("text-[10px] font-bold leading-tight bg-gradient-to-r bg-clip-text text-transparent", planColor)}>
                  {planLabel}
                </p>
              </div>
              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-72 rounded-2xl glass-strong border border-border shadow-2xl overflow-hidden z-50"
                >
                  {/* User Profile Header */}
                  <div className="px-4 py-3.5 border-b border-border bg-foreground/[0.02]">
                    <div className="flex items-center gap-3">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/30 shrink-0" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-base font-bold text-white uppercase shrink-0">
                          {user?.name ? user.name.charAt(0) : "U"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{user?.name || "User"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
                        <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r text-white", planColor)}>
                          {planLabel} Plan
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connected Instagram Account Card */}
                  <div className="p-3 border-b border-border bg-foreground/[0.01]">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 px-1">
                      Connected Instagram
                    </p>
                    {isConnected ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <div className="relative h-9 w-9 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                          {igAvatar ? (
                            <img src={igAvatar} alt="IG" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#12111A]">
                              <Instagram className="h-4 w-4 text-pink-400" />
                            </div>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#13131e] bg-emerald-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-foreground truncate">@{igHandle}</p>
                          <p className="text-[10px] text-muted-foreground truncate">Creator Account</p>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full px-2 py-0.5">
                          Active
                        </span>
                      </div>
                    ) : (
                      <Link href="/settings" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-border hover:border-violet-500/40 hover:bg-violet-500/5 transition-all text-left group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/10 text-pink-400 shrink-0">
                          <Instagram className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-foreground group-hover:text-violet-400 transition-colors">Connect Instagram</p>
                          <p className="text-[10px] text-muted-foreground">Link account in settings</p>
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <Link href="/settings" onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors">
                      <User className="h-4 w-4" /> Profile & Settings
                    </Link>
                    <Link href="/pricing" onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors">
                      <Zap className="h-4 w-4 text-violet-400" /> Subscription & Plan
                    </Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}
