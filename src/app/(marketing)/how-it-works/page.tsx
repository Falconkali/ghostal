"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Ghost,
  Archive,
  Zap,
  RefreshCw,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Check,
  Play,
  Upload,
  Brain,
  Radar,
  Bell,
  Instagram,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Layers,
  Repeat,
  Flame,
  Radio,
  FileText,
  Activity,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState<number>(0);

  // Step 1: Vault Mockup State
  const [vaultItems, setVaultItems] = useState([
    { id: 1, type: "Reel", title: "3 Growth Mistakes", reach: "48.2k", score: "96%", status: "Ready" },
    { id: 2, type: "Carousel", title: "Algorithm Playbook", reach: "62.1k", score: "98%", status: "Evergreen" },
    { id: 3, type: "Story", title: "Behind the Scenes Q&A", reach: "18.4k", score: "89%", status: "Backup" },
  ]);

  // Step 2: DNA Timing state
  const [selectedSlot, setSelectedSlot] = useState<string>("07:15 PM");

  // Step 3: Radar toggle
  const [radarSimMode, setRadarSimMode] = useState<"safe" | "warning">("safe");

  // Step 4: Caption remix toggle
  const [remixTone, setRemixTone] = useState<"bold" | "story" | "viral">("bold");

  const steps = [
    {
      id: 0,
      step: "01",
      icon: Upload,
      title: "Connect Instagram & Build Your Vault",
      subtitle: "Official Meta API v19.0 Sync",
      description:
        "Link your Instagram creator or business account securely via Meta's OAuth 2.0. Deposit your high-performing reels, carousels, and stories into the Ghostal Vault. AI automatically tags every asset by performance tier and evergreen potential.",
      badge: "Setup < 3 mins",
      gradient: "from-violet-500 to-purple-700",
      accent: "violet",
      bullets: [
        "Zero password storage — 100% Meta Graph API OAuth 2.0 compliant",
        "Bulk media drag-and-drop vault uploader with instant cloud processing",
        "AI categorises assets into High-Reach, Evergreen, and Emergency Backups",
      ],
      // Interactive Widget for Step 1
      widget: (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12] p-5 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md">
                <Instagram className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  @creator_studio
                  <CheckCircle2 className="h-3 w-3 text-cyan-400 fill-cyan-400/20" />
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Meta Graph API Connected
                </div>
              </div>
            </div>
            <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold text-violet-300">
              Vault Stock: 94%
            </span>
          </div>

          {/* Media Vault Grid */}
          <div className="mt-4 space-y-2.5">
            <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider flex justify-between">
              <span>Auto-Tagged Vault Items</span>
              <span className="text-violet-400">3 Ready for Autopilot</span>
            </div>
            {vaultItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 font-black text-xs border border-violet-500/20">
                    {item.type === "Reel" ? "📹" : item.type === "Carousel" ? "📸" : "📱"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{item.title}</div>
                    <div className="text-[10px] text-white/40 flex items-center gap-2">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span className="text-cyan-300">{item.reach} avg reach</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {item.score} Score
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Simulation CTA */}
          <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-3 text-center transition-colors hover:border-violet-500/40">
            <div className="text-xs font-semibold text-white/70 flex items-center justify-center gap-2">
              <Upload className="h-3.5 w-3.5 text-violet-400" />
              <span>Drag &amp; drop reels or click to auto-sync</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      step: "02",
      icon: Brain,
      title: "Ghost Mode Learns Your Posting DNA",
      subtitle: "AI Engagement & Timing Matrix",
      description:
        "Ghostal's AI analyses your historical engagement data, audience timezone clusters, and hashtag reach curves to construct a personalized Content Continuity Blueprint. It knows when your followers are most active.",
      badge: "AI DNA Engine",
      gradient: "from-cyan-500 to-blue-700",
      accent: "cyan",
      bullets: [
        "Identifies peak engagement windows tailored to your exact audience profile",
        "Calculates safe minimum posting frequency to prevent reach drop",
        "Generates a rolling 30-day adaptive posting timetable",
      ],
      // Interactive Widget for Step 2
      widget: (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-cyan-400" />
              <span className="text-xs font-bold text-white">Posting DNA Matrix</span>
            </div>
            <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
              98.4% Accuracy
            </span>
          </div>

          {/* Optimal Posting Slots */}
          <div className="mt-4">
            <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">
              AI Detected Peak Slots (Select Slot)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { time: "09:00 AM", score: "94%", active: false },
                { time: "02:30 PM", score: "88%", active: false },
                { time: "07:15 PM", score: "99%", active: true },
              ].map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`rounded-xl border p-2.5 text-center transition-all cursor-pointer ${
                    selectedSlot === slot.time
                      ? "border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/20"
                      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20"
                  }`}
                >
                  <div className="text-xs font-black">{slot.time}</div>
                  <div className="text-[9px] font-bold text-cyan-300 mt-0.5">{slot.score} Match</div>
                </button>
              ))}
            </div>
          </div>

          {/* DNA Graph Preview */}
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex justify-between text-[10px] text-white/50 font-bold mb-2">
              <span>Audience Activity Curve</span>
              <span className="text-cyan-400">Peak Window: {selectedSlot}</span>
            </div>
            <div className="flex items-end gap-1.5 h-16 pt-2">
              {[25, 40, 65, 90, 100, 75, 45, 30].map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      idx === 4 ? "bg-gradient-to-t from-cyan-500 to-blue-400 shadow-md shadow-cyan-500/30" : "bg-white/10"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      step: "03",
      icon: Radar,
      title: "24/7 Queue Health Radar Monitors Your Feed",
      subtitle: "Always-On Silent Guardian",
      description:
        "Ghost Mode runs silently in the background around the clock. If your manual queue runs low due to a busy schedule or vacation, the Radar triggers automatically to prevent your account from going dark.",
      badge: "24/7 Active Radar",
      gradient: "from-amber-500 to-orange-700",
      accent: "amber",
      bullets: [
        "Continuous background queue depth monitoring with 0ms latency",
        "Detects schedule gaps up to 14 days in advance",
        "Instant seamless takeover before your feed suffers reach penalties",
      ],
      // Interactive Widget for Step 3
      widget: (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
              <span className="text-xs font-bold text-white">Queue Health Radar</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRadarSimMode(radarSimMode === "safe" ? "warning" : "safe")}
                className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Simulate {radarSimMode === "safe" ? "Low Queue ⚠️" : "Safe Queue 🟢"}
              </button>
            </div>
          </div>

          {/* Radar Status Panel */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className={`rounded-xl border p-3 ${
              radarSimMode === "safe" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Queue Status</div>
              <div className="text-sm font-black mt-0.5 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${radarSimMode === "safe" ? "bg-emerald-400" : "bg-amber-400 animate-ping"}`} />
                {radarSimMode === "safe" ? "Safe (6 Days Buffered)" : "Low Queue Detected!"}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-white">
              <div className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Ghost Mode Takeover</div>
              <div className="text-sm font-black mt-0.5 text-amber-300">
                {radarSimMode === "safe" ? "Standby (Armed)" : "AUTO-TRIGGERED ⚡"}
              </div>
            </div>
          </div>

          {/* Live Action Toast Simulation */}
          <div className="mt-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
              <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>{radarSimMode === "safe" ? "Radar scanning feed continuity..." : "Autopilot queued Reel #2 from Evergreen Vault"}</span>
            </div>
            <span className="text-[9px] font-mono text-amber-400/70">LIVE</span>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      step: "04",
      icon: RefreshCw,
      title: "Evergreen Recycler Reschedules Your Best Work",
      subtitle: "Content Resurrection Engine",
      description:
        "Never let your top content die in the archive. Ghostal identifies your top 5% performing historical reels and carousels, remixes the captions with fresh AI copy, and re-queues them with optimal time gaps.",
      badge: "Resurrection Engine",
      gradient: "from-emerald-500 to-teal-700",
      accent: "emerald",
      bullets: [
        "Auto-selects top 5% winning assets based on saves, shares & reach",
        "AI caption remixer generates fresh copy variants in your authentic brand voice",
        "Enforces minimum 30-day spacing to prevent audience fatigue",
      ],
      // Interactive Widget for Step 4
      widget: (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-emerald-400" />
              <span className="text-xs font-bold text-white">Evergreen Recycler</span>
            </div>
            <div className="flex gap-1">
              {(["bold", "story", "viral"] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setRemixTone(tone)}
                  className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    remixTone === tone ? "bg-emerald-500 text-black font-black" : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Transformation comparison */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Original Post */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex justify-between text-[10px] text-white/40 font-bold mb-1">
                <span>ORIGINAL REEL (MAY 12)</span>
                <span className="text-white/50">84.2k Views</span>
              </div>
              <p className="text-xs text-white/60 italic line-clamp-2">
                &quot;Here are 3 mistakes I made when starting my business in 2024...&quot;
              </p>
            </div>

            {/* AI Remixed Version */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="flex justify-between text-[10px] text-emerald-300 font-bold mb-1">
                <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI REMIX ({remixTone.toUpperCase()})</span>
                <span className="text-emerald-400 font-black">+240% Reach</span>
              </div>
              <p className="text-xs font-medium text-emerald-100 line-clamp-2">
                {remixTone === "bold"
                  ? "&quot;Stop making these 3 critical mistakes if you want to scale faster this year...&quot;"
                  : remixTone === "story"
                  ? "&quot;I lost $5,000 learning these 3 lessons the hard way so you don't have to...&quot;"
                  : "&quot;90% of creators skip #2! Here's the exact breakdown of what works...&quot;"}
              </p>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[10px] font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Re-queued with 45-day safety spacing
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      step: "05",
      icon: Bell,
      title: "Smart Alerts Keep You in Complete Control",
      subtitle: "Transparent Push & Email Alerts",
      description:
        "You retain 100% creative command. Ghostal keeps you informed via real-time alerts whenever Ghost Mode takes action, when your vault needs fresh assets, or when a recycled post hits a reach milestone.",
      badge: "Creator Control",
      gradient: "from-pink-500 to-rose-700",
      accent: "pink",
      bullets: [
        "Instant push and email notifications whenever Ghost Mode triggers",
        "Low vault inventory warnings before assets run out",
        "Weekly performance summaries highlighting reach saved by autopilot",
      ],
      // Interactive Widget for Step 5
      widget: (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-pink-400 animate-bounce" style={{ animationDuration: "3s" }} />
              <span className="text-xs font-bold text-white">Live Smart Push Alerts</span>
            </div>
            <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-2.5 py-0.5 text-[10px] font-bold text-pink-300">
              Instant Sync
            </span>
          </div>

          {/* Alert Simulator Feed */}
          <div className="mt-4 space-y-2.5">
            <div className="flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 font-bold text-xs flex-shrink-0">
                ⚡
              </div>
              <div>
                <div className="text-xs font-bold text-white">Ghost Mode Takeover Activated</div>
                <div className="text-[10px] text-white/50">Auto-filled 6:15 PM slot with Reel #14 from Vault</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex-shrink-0">
                🔥
              </div>
              <div>
                <div className="text-xs font-bold text-white">Evergreen Milestone Hit</div>
                <div className="text-[10px] text-white/50">Recycled Reel #3 passed 100k views (+180% vs original)</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#07070d] text-white overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background Animated Gradient Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-60 top-1/4 h-[700px] w-[700px] rounded-full bg-violet-600/10 blur-[160px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute -right-60 top-2/3 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/8 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-28 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-300 shadow-lg shadow-violet-500/10">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Interactive Product Tour
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
            How Instagram Autopilot{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Actually Works.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/60 sm:text-lg">
            Experience the 5-step engine behind {APP_NAME}. Click through the interactive steps below to explore how Ghost Mode protects your reach 24/7.
          </p>
        </motion.div>

        {/* Interactive Step Switcher Tabs (Desktop & Mobile) */}
        <div className="mb-14 flex overflow-x-auto pb-2 justify-start sm:justify-center gap-2 no-scrollbar">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(idx)}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold transition-all duration-300 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "border-violet-500/50 bg-gradient-to-r from-violet-600/30 to-purple-600/30 text-white shadow-xl shadow-violet-500/20 scale-[1.02]"
                    : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black ${
                    isActive ? "bg-violet-500 text-white" : "bg-white/10 text-white/60"
                  }`}
                >
                  {s.step}
                </div>
                <span>{s.title.split(" ")[0]} {s.title.split(" ")[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Main Step Showcase (Active Step Highlight) */}
        <div className="mb-24">
          <AnimatePresence mode="wait">
            {steps.map((s, idx) => {
              if (idx !== activeStep) return null;
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center rounded-3xl border border-white/10 bg-[#0c0c16]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl"
                >
                  {/* Left Column: Text & Features */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} shadow-lg shadow-violet-500/20`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-violet-400">
                          Step {s.step} of 05
                        </span>
                        <div className="text-xs text-white/40 font-semibold">{s.subtitle}</div>
                      </div>
                    </div>

                    <h2 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl leading-tight">
                      {s.title}
                    </h2>

                    <p className="text-sm leading-relaxed text-white/60 sm:text-base">
                      {s.description}
                    </p>

                    <div className="space-y-2.5 pt-2">
                      {s.bullets.map((b) => (
                        <div key={b} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Step Nav Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <button
                        disabled={activeStep === 0}
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                      >
                        ← Previous
                      </button>
                      <button
                        disabled={activeStep === steps.length - 1}
                        onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                        className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:scale-105 disabled:opacity-30 cursor-pointer"
                      >
                        Next Step →
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Live Interactive Widget Demo */}
                  <div className="lg:col-span-6">
                    {s.widget}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Complete 5-Step Process Vertical Breakdown */}
        <div className="mb-28">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Complete Roadmap</span>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              All 5 Steps at a Glance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  onClick={() => {
                    setActiveStep(idx);
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer ${
                    activeStep === idx
                      ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                      : "border-white/10 bg-[#0d0d18]/60 hover:border-white/20 hover:bg-[#121222]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-violet-400">STEP {s.step}</span>
                      <Icon className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xs font-bold text-white leading-snug">{s.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Pillars Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
          className="mb-28"
        >
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
              The{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Four Pillars of Continuity
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/50 sm:text-base">
              Engineered so your creator account never suffers algorithmic drops.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Ghost,
                title: "Ghost Mode Autopilot",
                desc: "24/7 background queue manager that auto-fills schedule gaps.",
                gradient: "from-violet-500 to-purple-700",
              },
              {
                icon: Archive,
                title: "Evergreen Media Vault",
                desc: "Cloud-hosted asset library with AI tags & reach potential scoring.",
                gradient: "from-cyan-500 to-blue-700",
              },
              {
                icon: Sparkles,
                title: "AI Caption Remix",
                desc: "Rewrites historical captions in fresh brand voices with zero effort.",
                gradient: "from-emerald-500 to-teal-700",
              },
              {
                icon: ShieldCheck,
                title: "Meta Graph API v19",
                desc: "100% official Meta APIs — zero password collection or risk.",
                gradient: "from-amber-500 to-orange-700",
              },
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0d18]/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
                >
                  <div>
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} shadow-lg`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-white">{p.title}</h3>
                    <p className="text-xs leading-relaxed text-white/50">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Final CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-950/50 via-[#0e0c1a] to-cyan-950/40 p-10 text-center backdrop-blur-2xl shadow-2xl shadow-violet-500/20 sm:p-16"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
          </div>
          <div className="relative">
            <Ghost className="mx-auto mb-4 h-12 w-12 text-violet-400 animate-bounce" style={{ animationDuration: "3s" }} />
            <h2 className="mb-3 text-3xl font-black text-white sm:text-4xl md:text-5xl">
              Ready to Put Your Feed on{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                Autopilot?
              </span>
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-sm text-white/60 sm:text-base">
              Set up Ghostal in less than 3 minutes. Zero credit card required.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <InteractiveHoverButton
                  text="Start Free Trial — No Card Required"
                  className="text-sm sm:text-base px-8 py-4 shadow-2xl shadow-violet-500/40"
                />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
