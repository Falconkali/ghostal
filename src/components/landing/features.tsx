"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Ghost,
  Archive,
  Radar,
  Sparkles,
  Shield,
  Activity,
  RotateCcw,
  CheckCircle2,
  Zap,
  TrendingUp,
  Video,
  Layers,
  Lock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight Glass Bento Card Wrapper (Fast & Smooth)
// ─────────────────────────────────────────────────────────────────────────────
interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

function Card3D({ children, className, gradient = "from-violet-600 to-purple-800" }: Card3DProps) {
  return (
    <div className="relative h-full w-full">
      <div
        className={cn(
          "group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c14]/90 p-6 sm:p-8 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10",
          className
        )}
      >
        {/* Ambient Top Border Gradient Glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r via-violet-500/40 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        {children}

        {/* Corner Blur Glow */}
        <div
          className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Micro-Widgets for All 8 Bento Cards
// ─────────────────────────────────────────────────────────────────────────────

// Widget 1: Interactive Ghost Mode Toggle & Status Radar
function GhostModeWidget() {
  const [active, setActive] = useState(true);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("h-3 w-3 rounded-full transition-all duration-300", active ? "bg-emerald-400 shadow-[0_0_12px_#34d399]" : "bg-white/20")} />
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            Autopilot Status
          </span>
        </div>
        <button
          onClick={() => setActive(!active)}
          className={cn(
            "relative flex h-6 w-11 items-center rounded-full p-1 transition-colors duration-300 cursor-pointer",
            active ? "bg-violet-600" : "bg-white/10"
          )}
        >
          <div
            className={cn(
              "h-4 w-4 rounded-full bg-white transition-transform duration-300 shadow-md",
              active ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-black/40 px-3.5 py-2.5 text-xs">
        <span className="text-white/50">Backup Slot Target:</span>
        <span className="font-semibold text-violet-300 flex items-center gap-1.5">
          {active ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Auto-Backfill Active
            </>
          ) : (
            <span className="text-white/40">Paused</span>
          )}
        </span>
      </div>
    </div>
  );
}

// Widget 2: Interactive Media Vault Cards Stack
function VaultWidget() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2.5">
      {[
        { label: "Reel #04", type: "Evergreen", color: "from-violet-500/20 to-purple-600/20 border-violet-500/30" },
        { label: "Carousel", type: "High Reach", color: "from-cyan-500/20 to-blue-600/20 border-cyan-500/30" },
        { label: "Story QA", type: "Backup", color: "from-pink-500/20 to-rose-600/20 border-pink-500/30" },
      ].map((card, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col justify-between rounded-xl border bg-gradient-to-br p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/40",
            card.color
          )}
        >
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{card.type}</span>
          <span className="mt-2 text-xs font-semibold text-white">{card.label}</span>
        </div>
      ))}
    </div>
  );
}

// Widget 3: Live AI Caption Typing Refiner Widget
function CaptionWidget() {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-white/80">
      <div className="flex items-center justify-between text-[10px] text-white/40 mb-2 font-sans font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-violet-400">
          <Sparkles className="h-3 w-3" /> AI Tone Refiner
        </span>
        <span className="text-emerald-400 font-semibold">98% Match</span>
      </div>
      <p className="text-white/90 leading-relaxed font-sans text-xs">
        &ldquo;Struggling to stay consistent on IG? Here is the exact automated setup I use to post daily without burnout... &rdquo;
      </p>
    </div>
  );
}

// Widget 4: Consistency Momentum Live Chart Widget
function MomentumWidget() {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-white/50">30-Day Consistency Score</span>
        <span className="font-black text-emerald-400 text-sm flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" /> 98% Optimal
        </span>
      </div>
      <div className="h-10 w-full flex items-end gap-1.5 pt-2">
        {[40, 65, 80, 70, 95, 90, 100, 85, 95, 100].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-t from-violet-600/30 to-cyan-400/80 transition-all duration-500 hover:to-emerald-400"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Widget 5: Interactive Multi-Format Selector Widget
function MultiFormatWidget() {
  const [selected, setSelected] = useState(0);
  const formats = [
    { label: "📹 Reel", status: "Cover Thumbnail + Auto-Audio" },
    { label: "📸 Carousel", status: "Multi-Slide Auto-Swipe" },
    { label: "📱 Story", status: "Time-Sensitive Sticker Queue" },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex gap-2 mb-3">
        {formats.map((fmt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-[11px] font-bold transition-all cursor-pointer",
              selected === i
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            )}
          >
            {fmt.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-black/40 px-3 py-2 text-[11px] text-white/60 flex items-center justify-between">
        <span>Publish Spec:</span>
        <span className="font-semibold text-cyan-300">{formats[selected].status}</span>
      </div>
    </div>
  );
}

// Widget 6: Meta Graph API Shield Verification Badge Widget
function MetaShieldWidget() {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <Lock className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Official Meta API v19.0</h4>
          <p className="text-[10px] text-emerald-400 font-semibold">100% Shadowban Protected</p>
        </div>
      </div>
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    </div>
  );
}

// Widget 7: Animated Circular Scanning Radar Widget for top right corner
function RadarScanner() {
  return (
    <div className="relative h-14 w-14 flex-shrink-0 rounded-full border border-amber-500/40 bg-black/60 p-1 shadow-inner shadow-amber-500/30 overflow-hidden">
      {/* Concentric radar rings */}
      <div className="absolute inset-2 rounded-full border border-amber-500/25" />
      <div className="absolute inset-4 rounded-full border border-amber-500/30" />
      
      {/* Radar crosshairs */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-full w-px bg-amber-500/20" />
        <div className="h-px w-full bg-amber-500/20" />
      </div>

      {/* Rotating 360-degree radar beam sweep — static conic, no spin (GPU-friendly) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg 270deg, rgba(245, 158, 11, 0.5) 360deg)",
        }}
      />

      {/* Pulsing center ping dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
        {/* Static glow ring instead of animate-ping */}
        <div className="absolute h-4 w-4 rounded-full border border-amber-400/40" />
      </div>
    </div>
  );
}

// Widget 7: Queue Depletion Radar Gauge Widget
function RadarWidget() {
  return (
    <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-white/50">Queue Depletion Risk</span>
        <span className="font-bold text-emerald-400 text-xs flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> LOW RISK
        </span>
      </div>
      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full w-[85%]" />
      </div>
      <p className="mt-2 text-[10px] text-white/40 text-right">Auto-Trigger: 48h Backlog Buffer</p>
    </div>
  );
}

// Widget 8: Evergreen Recycler Top Post Card Widget
function RecyclerWidget() {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
          <RefreshCw className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Top 5% Performance Match</span>
          <h4 className="text-xs font-bold text-white">Reel #12: &ldquo;3 IG Consistency Hacks&rdquo;</h4>
        </div>
      </div>
      <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
        +240% Reach
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main 8-Card 3D Perspective Bento Grid Features Section
// ─────────────────────────────────────────────────────────────────────────────
export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      id="features"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#07070d]"
    >
      {/* Background radial glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 top-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute -left-40 bottom-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-300">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            3D Feature Engine
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
            Built For Creator <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">Survival</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            Every feature is an automated shield for your Instagram presence — keeping your audience engaged even when you&apos;re completely offline.
          </p>
        </motion.div>

        {/* 8-Card 3D Bento Grid Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Ghost Mode (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 lg:col-span-2"
          >
            <Card3D gradient="from-violet-600 to-purple-800">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 shadow-lg shadow-violet-500/20">
                    <Ghost className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Ghost Mode (Autopilot)</h3>
                    <p className="text-xs font-semibold text-violet-300 uppercase tracking-wider">Your Schedule Fail-Safe</p>
                  </div>
                </div>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/60">
                  An automated backup assistant. When Ghost Mode is active, it continuously monitors your schedule and auto-populates calendar gaps using evergreen assets from your vault backlog.
                </p>
              </div>
              <GhostModeWidget />
            </Card3D>
          </motion.div>

          {/* Card 2: Content Vault */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-1 lg:col-span-1"
          >
            <Card3D gradient="from-cyan-500 to-blue-700">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20">
                    <Archive className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Content Vault</h3>
                    <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Creative Arsenal</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Upload reels, photos, and carousels. AI organizes everything with smart auto-tagging for instant retrieval when backfill kicks in.
                </p>
              </div>
              <VaultWidget />
            </Card3D>
          </motion.div>

          {/* Card 3: AI Caption Refiner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-1 lg:col-span-1"
          >
            <Card3D gradient="from-pink-500 to-rose-700">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-700 shadow-lg shadow-pink-500/20">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Caption Refiner</h3>
                    <p className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Brand Voice Preserved</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  AI generates variations of archived copy to keep recycled posts fresh while maintaining your brand tone.
                </p>
              </div>
              <CaptionWidget />
            </Card3D>
          </motion.div>

          {/* Card 4: Momentum & Consistency Dashboard (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="md:col-span-2 lg:col-span-2"
          >
            <Card3D gradient="from-indigo-500 to-violet-700">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-700 shadow-lg shadow-indigo-500/20">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Consistency Dashboard</h3>
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Growth Vital Signs</p>
                  </div>
                </div>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/60">
                  Track consistency scores, queue depletion risks, calendar stability, and queue health. Know exactly where your content pipeline stands at all times.
                </p>
              </div>
              <MomentumWidget />
            </Card3D>
          </motion.div>

          {/* Card 5: Multi-Format Engine */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-1 lg:col-span-1"
          >
            <Card3D gradient="from-purple-500 to-indigo-700">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 shadow-lg shadow-purple-500/20">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Multi-Format Engine</h3>
                    <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Reels, Stories, Carousels</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Schedule video Reels with custom covers, multi-slide Carousels, and time-sensitive Stories directly into your queue.
                </p>
              </div>
              <MultiFormatWidget />
            </Card3D>
          </motion.div>

          {/* Card 6: Meta Graph API Shield */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="md:col-span-1 lg:col-span-1"
          >
            <Card3D gradient="from-emerald-500 to-teal-700">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Meta API Safety Shield</h3>
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">100% Account Compliant</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Zero web scraping or browser automation. Connected directly via official Meta Graph API v19.0 endpoints.
                </p>
              </div>
              <MetaShieldWidget />
            </Card3D>
          </motion.div>

          {/* Card 7: Queue Depletion Radar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-1 lg:col-span-1"
          >
            <Card3D gradient="from-amber-500 to-orange-700">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 shadow-lg shadow-amber-500/20">
                      <Radar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Queue Empty Alerts</h3>
                      <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Radar Monitoring</p>
                    </div>
                  </div>
                  <RadarScanner />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  Detects schedule gaps and low-queue risks before they happen, auto-triggering backup assets before your feed goes cold.
                </p>
              </div>
              <RadarWidget />
            </Card3D>
          </motion.div>

          {/* Card 8: Evergreen Recycler (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="md:col-span-2 lg:col-span-2"
          >
            <Card3D gradient="from-teal-500 to-cyan-700">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 shadow-lg shadow-teal-500/20">
                    <RotateCcw className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Evergreen Recycler</h3>
                    <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Repurpose Winning Assets</p>
                  </div>
                </div>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/60">
                  Automatically identifies your top-performing historical posts and reschedules them with fresh AI caption variations whenever your content pipeline hits a dry spell.
                </p>
              </div>
              <RecyclerWidget />
            </Card3D>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
