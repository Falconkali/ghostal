"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Zap, Shield, Ghost, Brain } from "lucide-react";
import { APP_TAGLINE, APP_DESCRIPTION } from "@/lib/constants";

const floatingCards = [
  {
    text: "Ghost Mode Activated",
    icon: Ghost,
    position: "top-[18%] left-[3%] sm:left-[6%]",
    delay: 0.8,
    gradient: "from-violet-600/20 to-purple-900/20",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    text: "Queue Running Low",
    icon: Zap,
    position: "top-[32%] right-[3%] sm:right-[5%]",
    delay: 1.1,
    gradient: "from-amber-600/20 to-orange-900/20",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    text: "AI Survival Mode Enabled",
    icon: Brain,
    position: "bottom-[28%] left-[5%] sm:left-[8%]",
    delay: 1.4,
    gradient: "from-cyan-600/20 to-blue-900/20",
    borderColor: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    text: "Account Momentum Protected",
    icon: Shield,
    position: "bottom-[18%] right-[4%] sm:right-[7%]",
    delay: 1.7,
    gradient: "from-emerald-600/20 to-green-900/20",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20 sm:px-6 lg:px-8"
    >
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 animate-glow-pulse" />
        <div
          className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/15 animate-glow-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/10 animate-glow-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Dot grid overlay */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />

      {/* Radial fade at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#09090f] to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 backdrop-blur-sm"
        >
          <span className="text-base">✨</span>
          AI-Powered Creator Continuity System
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="gradient-text glow-text">{APP_TAGLINE}</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-white/60 sm:text-xl"
        >
          {APP_DESCRIPTION}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/signup"
            className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 blur-xl transition-opacity group-hover:opacity-40" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Play className="h-5 w-5 fill-current" />
            Watch Demo
          </Link>
        </motion.div>
      </div>

      {/* Floating UI Cards */}
      {floatingCards.map((card, i) => (
        <motion.div
          key={card.text}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={
            isInView
              ? { opacity: 1, scale: 1, y: 0 }
              : {}
          }
          transition={{ duration: 0.7, delay: card.delay }}
          className={`absolute hidden lg:flex ${card.position} animate-float`}
          style={{ animationDelay: `${i * 0.5}s` }}
        >
          <div
            className={`flex items-center gap-3 rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.gradient} px-4 py-3 backdrop-blur-xl shadow-2xl`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ${card.iconColor}`}
            >
              <card.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-white/90 whitespace-nowrap">
              {card.text}
            </span>
          </div>
        </motion.div>
      ))}
    </section>
  );
}
