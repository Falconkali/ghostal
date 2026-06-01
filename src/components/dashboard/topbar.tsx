"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Menu, User, CreditCard, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

interface TopbarProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export default function Topbar({ onMobileMenuToggle, sidebarCollapsed }: TopbarProps) {
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<any[]>([]);
  const [lastChecked, setLastChecked] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ghostflow_notifications_checked");
      if (stored) {
        setLastChecked(parseInt(stored, 10));
      }
    }
  }, []);

  const fetchLogs = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("survival_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false })
        .limit(6);
      if (data && !error) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Listen to automation run to update notifications dynamically
    const handleAutomationRun = () => fetchLogs();
    window.addEventListener("automation_run", handleAutomationRun);
    return () => window.removeEventListener("automation_run", handleAutomationRun);
  }, [user?.id]);

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    setProfileOpen(false);
    if (!notifOpen) {
      const now = Date.now();
      setLastChecked(now);
      localStorage.setItem("ghostflow_notifications_checked", now.toString());
    }
  };

  const unreadCount = logs.filter(
    (log) => new Date(log.timestamp).getTime() > lastChecked
  ).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const planLabel =
    user?.plan === "creator_pro"
      ? "Creator Pro"
      : user?.plan === "survival_ai"
      ? "Survival AI"
      : "Starter";

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-white/5 px-4 md:px-5 glass transition-all duration-300 left-0",
        sidebarCollapsed ? "md:left-16" : "md:left-56"
      )}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/5 text-zinc-400 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search anything..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={cn(
            "w-full rounded-lg border bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition-all duration-200",
            searchFocused
              ? "border-violet-500/50 bg-white/[0.07] shadow-[0_0_20px_rgba(139,92,246,0.1)]"
              : "border-white/5"
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={handleNotifClick}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
                className="absolute right-0 top-12 w-85 rounded-xl glass-strong border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-xs text-zinc-500">{unreadCount} new</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-zinc-500">
                      No recent activity logs.
                    </div>
                  ) : (
                    logs.map((log) => {
                      const isUnread = new Date(log.timestamp).getTime() > lastChecked;
                      const logType = log.status === "success" ? "success" : log.status === "warning" ? "warning" : "info";
                      return (
                        <div
                          key={log.id}
                          className={cn(
                            "flex gap-3 px-4 py-3 border-b border-white/5 last:border-0 transition-colors hover:bg-white/5",
                            isUnread && "bg-violet-500/5"
                          )}
                        >
                          <div
                            className={cn(
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                              logType === "success" && "bg-emerald-500",
                              logType === "warning" && "bg-amber-500",
                              logType === "info" && "bg-blue-500"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{log.action}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{log.description}</p>
                            <p className="text-[10px] text-zinc-500 mt-1.5">
                              {new Date(log.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="User Avatar"
                className="h-8 w-8 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white uppercase select-none">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-tight">{user?.name || "User"}</p>
              <p className="text-[11px] text-zinc-500 leading-tight">{planLabel}</p>
            </div>
            <ChevronDown className="hidden sm:block h-4 w-4 text-zinc-500" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 rounded-xl glass-strong border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
                  <p className="text-xs text-zinc-400">{user?.email || ""}</p>
                  <span className="mt-1.5 inline-block rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
                    {planLabel}
                  </span>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: "Profile", href: "/settings" },
                    { icon: CreditCard, label: "Billing", href: "/settings" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
                      onClick={() => setProfileOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-white/5 py-1">
                  <button 
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
