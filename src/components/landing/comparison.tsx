"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";

const comparisonRows = [
  { feature: "Auto inactivity detection", traditional: false, ghostflow: true },
  { feature: "AI survival posting", traditional: false, ghostflow: true },
  { feature: "Automatic continuity", traditional: false, ghostflow: true },
  { feature: "Content resurrection", traditional: false, ghostflow: true },
  { feature: "Evergreen reposting", traditional: false, ghostflow: true },
  { feature: "AI caption remix", traditional: false, ghostflow: true },
  { feature: "Content vault system", traditional: false, ghostflow: true },
  { feature: "Burnout-proof design", traditional: false, ghostflow: true },
  { feature: "Manual scheduling", traditional: true, ghostflow: true },
  { feature: "Queue management", traditional: true, ghostflow: true },
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
            <span className="gradient-text">Why GhostFlow Is Different</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            Traditional schedulers help you post. GhostFlow makes sure you never
            stop.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-white/5"
        >
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
                GhostFlow
              </span>
            </div>
          </div>

          {/* Table Rows */}
          {comparisonRows.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
