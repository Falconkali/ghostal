"use client";

import * as React from "react";
import { useState, useId } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calculator,
  Clock,
  TrendingUp,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Ghost,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function CalculatorPage() {
  // Unique IDs for accessibility
  const postsId = useId();
  const minsId = useId();
  const rateId = useId();

  // Calculator State Inputs
  const [postsPerWeek, setPostsPerWeek] = useState<number>(5);
  const [minsPerPost, setMinsPerPost] = useState<number>(45);
  const [hourlyRate, setHourlyRate] = useState<number>(35);
  const [ghostModeEnabled, setGhostModeEnabled] = useState<boolean>(true);
  const [recyclerEnabled, setRecyclerEnabled] = useState<boolean>(true);

  // Calculations
  const weeklyMinutesManual = postsPerWeek * minsPerPost;
  const monthlyHoursManual = Math.round((weeklyMinutesManual * 4.33) / 60);
  
  // Ghostal saves ~80% of manual scheduling & queue management time
  const monthlyHoursSaved = Math.round(monthlyHoursManual * (ghostModeEnabled ? 0.82 : 0.5));
  const monthlyMoneySaved = Math.round(monthlyHoursSaved * hourlyRate);

  // Estimated reach boost calculated based on posting frequency & evergreen recycling
  const baseReach = postsPerWeek * 3400;
  const reachMultiplier = (ghostModeEnabled ? 1.45 : 1.0) + (recyclerEnabled ? 0.35 : 0.0);
  const estimatedReachBoost = Math.round(baseReach * reachMultiplier);

  const consistencyScore = ghostModeEnabled ? (recyclerEnabled ? 98 : 92) : 65;

  return (
    <div className="relative min-h-screen bg-[#07070d] text-white pt-28 pb-24 overflow-hidden">
      {/* Background Glow Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute -right-40 bottom-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
            <Calculator className="h-3.5 w-3.5 text-cyan-400" />
            Creator ROI Calculator
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Calculate Your <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">Time &amp; Reach Saved</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            Adjust your current Instagram posting habits below to see instant estimates of how much time, money, and algorithm reach Ghost Mode protects for you.
          </p>
        </motion.div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Controls Column (Span 6) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0d0d16]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
          >
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <SlidersIcon className="h-5 w-5 text-violet-400" />
                Your Posting Habits
              </h2>

              {/* Slider 1: Posts per week */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor={postsId} className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Posts &amp; Reels per week
                  </label>
                  <span className="rounded-lg bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-sm font-black text-violet-300">
                    {postsPerWeek} posts / wk
                  </span>
                </div>
                <input
                  id={postsId}
                  type="range"
                  min="1"
                  max="14"
                  value={postsPerWeek}
                  onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-violet-500"
                />
                <div className="mt-1 flex justify-between text-[10px] text-white/30">
                  <span>1 post</span>
                  <span>7 posts (Daily)</span>
                  <span>14 posts (2x Daily)</span>
                </div>
              </div>

              {/* Slider 2: Creation & Scheduling Mins per post */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor={minsId} className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Creation &amp; Queue Time per Post
                  </label>
                  <span className="rounded-lg bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-sm font-black text-cyan-300">
                    {minsPerPost} mins / post
                  </span>
                </div>
                <input
                  id={minsId}
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={minsPerPost}
                  onChange={(e) => setMinsPerPost(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400"
                />
                <div className="mt-1 flex justify-between text-[10px] text-white/30">
                  <span>15 mins</span>
                  <span>45 mins</span>
                  <span>2 hours</span>
                </div>
              </div>

              {/* Slider 3: Hourly Creator Value */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor={rateId} className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Your Hourly Creator Value ($/hr)
                  </label>
                  <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-sm font-black text-emerald-300">
                    ${hourlyRate} / hr
                  </span>
                </div>
                <input
                  id={rateId}
                  type="range"
                  min="15"
                  max="150"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400"
                />
                <div className="mt-1 flex justify-between text-[10px] text-white/30">
                  <span>$15/hr</span>
                  <span>$50/hr</span>
                  <span>$150/hr</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                
                {/* Toggle 1: Ghost Mode Autopilot */}
                <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                      <Ghost className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Ghost Mode Autopilot</h3>
                      <p className="text-[10px] text-white/40">Auto-fill queue gaps from vault</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGhostModeEnabled(!ghostModeEnabled)}
                    className={`relative flex h-6 w-11 items-center rounded-full p-1 transition-colors cursor-pointer ${
                      ghostModeEnabled ? "bg-violet-600" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        ghostModeEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Evergreen Vault Recycler */}
                <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Evergreen Recycler</h3>
                      <p className="text-[10px] text-white/40">Reschedule top 5% historical reels</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRecyclerEnabled(!recyclerEnabled)}
                    className={`relative flex h-6 w-11 items-center rounded-full p-1 transition-colors cursor-pointer ${
                      recyclerEnabled ? "bg-cyan-500" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        recyclerEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Calculated Output Column (Span 6) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-[#0e0c1a] to-cyan-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-violet-500/10"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  Your Estimated Return
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Calculated Live
                </span>
              </div>

              {/* Big Metric Cards Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                
                {/* Metric 1: Monthly Time Saved */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Clock className="h-4 w-4" /> Time Saved
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    {monthlyHoursSaved} <span className="text-sm font-medium text-white/50">hrs/mo</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/40">
                    ≈ {Math.round((monthlyHoursSaved / 8) * 10) / 10} full work days free
                  </p>
                </div>

                {/* Metric 2: Estimated Value Saved */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <DollarSign className="h-4 w-4" /> Value Saved
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                    ${monthlyMoneySaved} <span className="text-sm font-medium text-emerald-400/60">/mo</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/40">
                    Based on ${hourlyRate}/hr rate
                  </p>
                </div>

                {/* Metric 3: Consistency Score */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <TrendingUp className="h-4 w-4" /> Consistency Score
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    {consistencyScore}% <span className="text-sm font-medium text-emerald-400">Optimal</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/40">
                    vs. 32% manual burnout risk
                  </p>
                </div>

                {/* Metric 4: Estimated Organic Reach */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="h-4 w-4" /> Extra Reach
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    +{(estimatedReachBoost / 1000).toFixed(1)}k <span className="text-xs font-medium text-white/50">views/mo</span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/40">
                    Driven by 24/7 consistency
                  </p>
                </div>

              </div>

              {/* Guarantees List */}
              <div className="space-y-2.5 rounded-2xl bg-black/40 p-4 border border-white/5 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>100% Meta Graph API Compliant</strong> — Zero shadowban risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-violet-400 flex-shrink-0" />
                  <span><strong>Ghost Mode Continuity</strong> — Never miss a post deadline</span>
                </div>
              </div>
            </div>

            {/* Direct Action Button */}
            <div className="mt-8">
              <Link href="/signup" className="block w-full">
                <InteractiveHoverButton
                  text={`Reclaim ${monthlyHoursSaved} Hours/Mo — Start Free`}
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 border-0 text-white font-bold py-4 h-auto text-base sm:text-lg"
                />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Side-by-Side Comparison Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 rounded-3xl border border-white/10 bg-[#0c0c14] p-6 sm:p-10"
        >
          <h2 className="text-center text-2xl sm:text-3xl font-black text-white mb-8">
            Manual Grind vs. <span className="gradient-text">{APP_NAME} Autopilot</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Manual Grind Column */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5" /> Manual Scheduling Grind
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  Spend {monthlyHoursManual} hours every month manually drafting and scheduling posts.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  Schedule gaps occur when life happens, hurting your Instagram algorithm reach.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  Constant stress about queue emptying out during vacations or busy weeks.
                </li>
              </ul>
            </div>

            {/* Ghostal Column */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Ghostal Autopilot
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  Save {monthlyHoursSaved} hours/month with automated vault backfill.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  Maintain a 98% optimal consistency score 24/7 without manual intervention.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  Evergreen Recycler re-uses top 5% winning reels with fresh AI captions.
                </li>
              </ul>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}
