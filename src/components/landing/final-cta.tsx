"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-violet-600/20 animate-glow-pulse blur-[60px]" />
          <div
            className="absolute -right-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-cyan-500/15 animate-glow-pulse blur-[60px]"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-violet-600/10 via-[#12121a] to-cyan-500/10 p-8 sm:p-12 md:p-16 text-center"
        >
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          </div>

          {/* Dot grid */}
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
          >
            <span className="gradient-text">
              Your Audience Shouldn&apos;t Disappear Just Because You Got Busy.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative z-10 mx-auto mt-6 max-w-xl text-base text-white/50 sm:text-lg"
          >
            Join thousands of creators who maintain their schedule consistency sustainably.
            Start your free trial today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative z-10 mt-10"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110 sm:text-lg"
            >
              Start Building Your Backup System
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 blur-xl transition-opacity group-hover:opacity-40" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
