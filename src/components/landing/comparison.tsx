"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check, Zap, AlertTriangle, ShieldCheck, Ghost } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const comparisonRows = [
  { feature: "Auto inactivity detection", traditional: false, Ghostal: true },
  { feature: "AI survival posting", traditional: false, Ghostal: true },
  { feature: "Automatic continuity", traditional: false, Ghostal: true },
  { feature: "Content resurrection", traditional: false, Ghostal: true },
  { feature: "Evergreen reposting", traditional: false, Ghostal: true },
  { feature: "AI caption remix", traditional: false, Ghostal: true },
  { feature: "Content vault system", traditional: false, Ghostal: true },
  { feature: "Burnout-proof design", traditional: false, Ghostal: true },
  { feature: "Manual scheduling", traditional: true, Ghostal: true },
  { feature: "Queue management", traditional: true, Ghostal: true },
];

export default function Comparison() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      ref={ref}
      id="comparison"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Comparison
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="gradient-text">Why {APP_NAME} Is Different</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            Traditional schedulers help you post. Ghostal makes sure you never
            stop.
          </p>
        </motion.div>

        {/* Original Clean Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="overflow-x-auto rounded-2xl border border-white/5 mb-14"
        >
          <div className="min-w-[480px]">
            {/* Table Header */}
            <div className="grid grid-cols-3 border-b border-white/5 bg-[#12121a]">
              <div className="p-4 sm:p-6">
                <span className="text-sm font-medium text-white/40">Feature</span>
              </div>
              <div className="flex items-center justify-center border-l border-white/5 p-4 sm:p-6">
                <span className="text-sm font-semibold text-white/60">
                  Traditional Schedulers
                </span>
              </div>
              <div className="relative flex items-center justify-center border-l border-white/5 p-4 sm:p-6">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent" />
                <span className="relative z-10 text-sm font-bold gradient-text">
                  Ghostal
                </span>
              </div>
            </div>

            {/* Table Rows */}
            {comparisonRows.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center p-4 sm:p-5">
                  <span className="text-sm text-white/70">{row.feature}</span>
                </div>
                <div className="flex items-center justify-center border-l border-white/5 p-4 sm:p-5">
                  {row.traditional ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
                      <Check className="h-4 w-4 text-white/30" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10">
                      <X className="h-4 w-4 text-red-400/70" />
                    </div>
                  )}
                </div>
                <div className="relative flex items-center justify-center border-l border-white/5 p-4 sm:p-5">
                  <div className="absolute inset-0 bg-gradient-to-b from-violet-600/[0.03] to-transparent" />
                  <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dual Spotlight Comparison Cards Below Table */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Card 1: Traditional Schedulers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-between rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-[#0e0c14] to-black/60 p-6 sm:p-8 backdrop-blur-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400/80 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Traditional Schedulers
                </span>
                <span className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-400">
                  0% Backfill Safety
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">The Manual Queue Grind</h3>
              <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-6">
                When your buffer queue runs dry during busy weeks, exams, or vacations, your posting stops entirely. Algorithm reach drops immediately.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl bg-black/40 p-4 border border-white/5 text-xs text-white/40">
              <div className="flex items-center gap-2 text-red-400/70">
                <X className="h-4 w-4 flex-shrink-0" />
                <span>Queue empties = Feed goes completely dark</span>
              </div>
              <div className="flex items-center gap-2 text-red-400/70">
                <X className="h-4 w-4 flex-shrink-0" />
                <span>Zero AI fallback or asset recycling</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Ghostal Autopilot */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col justify-between rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-950/40 via-[#0e0c1a] to-cyan-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-violet-500/10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Ghost className="h-4 w-4 text-violet-400" /> {APP_NAME} Autopilot
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> 100% Zero-Downtime
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 AI Continuity Engine</h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
                Ghost Mode continuously monitors your queue health. If gaps are detected, AI automatically backfills your schedule using top vault assets.
              </p>
            </div>
            <div className="space-y-2 rounded-2xl bg-black/50 p-4 border border-violet-500/20 text-xs text-white/80">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>Automated Vault Backfill &amp; Evergreen Recycler</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-violet-400" />
                <span>98% Algorithm Consistency Score guaranteed</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
