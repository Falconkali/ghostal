"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Archive,
  Calendar,
  Ghost,
  Brain,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from "lucide-react";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Archive,
  Calendar,
  Ghost,
  Brain,
  BarChart3,
  Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { instagramConnected, logout } = useAuth();

  const renderSidebarContent = (forceExpand: boolean) => {
    const isCollapsed = forceExpand ? false : collapsed;
    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/5 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500">
            <Ghost className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap text-lg font-bold gradient-text"
              >
                GhostFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {DASHBOARD_NAV.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-violet-600/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="relative">
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-glow"
                      className="absolute -inset-1.5 rounded-md bg-violet-500/20 blur-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Ghost Mode Indicator */}
        <div className="border-t border-white/5 px-3 py-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <div className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              <span className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                instagramConnected ? "bg-emerald-400" : "bg-amber-400"
              )} />
              <span className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                instagramConnected ? "bg-emerald-500" : "bg-amber-500"
              )} />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "overflow-hidden whitespace-nowrap text-xs font-medium",
                    instagramConnected ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  {instagramConnected ? "Ghost Mode Active" : "Integration Required"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse Toggle & Logout */}
        <div className="border-t border-white/5 px-3 py-3 space-y-1">
          <button
            onClick={onToggle}
            className="hidden md:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
          <button 
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Logout
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
      {/* Desktop Sidebar — uses custom CSS classes from globals.css (not Tailwind)
          so width is guaranteed to be correct in the deployed CSS bundle. */}
      <aside
        className={cn(
          "hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col glass-strong border-r border-white/5 overflow-hidden",
          collapsed ? "sidebar-w-sm" : "sidebar-w"
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ duration: 0.3, ease: "easeInOut" as const }}
              className="fixed left-0 top-0 z-50 h-screen w-56 flex flex-col glass-strong border-r border-white/5 md:hidden"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
