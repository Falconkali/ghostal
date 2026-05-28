"use client";

import { motion } from "framer-motion";
import { Instagram, Link2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface IntegrationRequiredProps {
  pageName: string;
  description?: string;
}

export default function IntegrationRequired({
  pageName,
  description = "Connect your Instagram account to start syncing data, scheduling posts, activating autopilot continuity, and analyzing momentum metrics.",
}: IntegrationRequiredProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="glass rounded-3xl p-8 max-w-lg w-full text-center border border-white/5 glow-violet flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Dot grid inside card */}
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />

        {/* Icon Handshake Animation */}
        <div className="relative mb-6 flex items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
            <Link2 className="h-6 w-6 animate-pulse" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-red-500 to-amber-500 text-white shadow-lg shadow-pink-500/20">
            <Instagram className="h-8 w-8" />
          </div>
        </div>

        <span className="inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400 uppercase mb-4 tracking-wider">
          Integration Required
        </span>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Unlock {pageName}
        </h2>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-sm">
          {description}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            href="/settings"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98]"
          >
            Configure Integration
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
