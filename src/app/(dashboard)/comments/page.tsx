"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  Bell,
  Zap,
  Shield,
  BarChart2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time Comment Tracking",
    description: "See every comment on your posts the moment it lands",
  },
  {
    icon: Sparkles,
    title: "AI Auto-Reply",
    description: "Let Ghostal reply intelligently so you never miss engagement",
  },
  {
    icon: BarChart2,
    title: "Sentiment Analysis",
    description: "Understand the vibe of your comments at a glance",
  },
  {
    icon: Shield,
    title: "Spam & Toxic Filter",
    description: "Automatically hide harmful or irrelevant comments",
  },
];

const floatingParticles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 4,
}));

export default function CommentsComingSoonPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-16">

      {/* ── Ambient background blobs ─────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-pink-600/8 blur-[100px]" />
        <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-indigo-600/8 blur-[90px]" />
      </div>

      {/* ── Floating particles ───────────────────────────────── */}
      {floatingParticles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute rounded-full bg-violet-400/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Main card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-2xl"
      >
        {/* Glowing border effect */}
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-pink-500/20 blur-sm" />

        <div className="relative rounded-3xl border border-white/[0.07] bg-[#0a0912]/90 backdrop-blur-xl px-8 py-12 text-center space-y-8">

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto"
          >
            <div className="relative mx-auto h-20 w-20">
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/30 to-pink-500/30"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                <MessageSquare className="h-9 w-9 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs font-semibold tracking-widest text-violet-300 uppercase">
              Coming Soon
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="text-white">Comments</span>{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                are getting a glow-up
              </span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              We&apos;re building a powerful comment management hub so you can track,
              auto-reply, and analyse every conversation — all in one place.
            </p>
          </motion.div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Upcoming features grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 py-3.5 hover:border-violet-500/20 hover:bg-violet-500/[0.04] transition-all duration-300"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
                  <f.icon className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{f.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Notify CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Bell className="h-3.5 w-3.5 text-violet-400" />
              <span>We&apos;ll notify you when it launches — stay tuned.</span>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-zinc-600">Development progress</span>
                <span className="text-[10px] font-bold text-violet-400">68%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-xs text-zinc-600 text-center"
      >
        Check back soon — this is going to be good. 👀
      </motion.p>
    </div>
  );
}
