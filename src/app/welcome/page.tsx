"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Ghost,
  ShieldCheck,
  Zap,
  Calendar,
  Layers,
} from "lucide-react";

function WelcomeContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get("plan") || "Creator Pro";
  const cycle = searchParams.get("cycle") || "month";

  const isAnnual = cycle === "year" || cycle === "annual";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative max-w-lg w-full rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-950/50 via-[#0d0d18] to-cyan-950/40 p-8 sm:p-10 backdrop-blur-2xl text-center shadow-2xl shadow-violet-500/25"
    >
      {/* Icon Badge */}
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25">
        <CheckCircle2 className="h-8 w-8 text-white" />
      </div>

      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-bold text-emerald-400">
        <Sparkles className="h-3.5 w-3.5" /> Subscription Active
      </span>

      <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
        Welcome to{" "}
        <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
          Ghostal!
        </span>
      </h1>

      <p className="mt-3 text-sm text-white/60 leading-relaxed">
        Your payment &amp; mandate were authorized successfully. Ghost Mode is now active on your account.
      </p>

      {/* Plan Card Summary */}
      <div className="mt-6 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-white/50">
              Subscribed Plan
            </span>
          </div>
          <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase">
            {isAnnual ? "Annual Billing" : "Monthly Billing"}
          </span>
        </div>
        <div className="mt-2 text-2xl font-black text-white">
          {planName} <span className="text-xs font-semibold text-emerald-400">Plan</span>
        </div>
      </div>

      {/* Features Status */}
      <div className="mt-6 space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-xs text-white/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ghost className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <span><strong>Ghost Mode Autopilot:</strong></span>
          </div>
          <span className="text-emerald-400 font-bold">Armed &amp; Ready ⚡</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <span><strong>Content Vault:</strong></span>
          </div>
          <span className="text-cyan-300 font-bold">Unlimited Storage</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Meta API v19 Sync:</strong></span>
          </div>
          <span className="text-emerald-400 font-bold">100% Compliant</span>
        </div>
      </div>

      {/* Dashboard CTA */}
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 py-3.5 px-6 text-sm font-bold text-white shadow-xl shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Open Your Dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen bg-[#07070d] text-white flex items-center justify-center p-4 overflow-hidden">
      {/* Glow Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute right-10 top-10 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <Suspense fallback={
        <div className="text-center text-white/50 text-sm">
          Loading your welcome confirmation...
        </div>
      }>
        <WelcomeContent />
      </Suspense>
    </div>
  );
}
