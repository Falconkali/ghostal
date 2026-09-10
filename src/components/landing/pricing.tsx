"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, Crown, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/lib/constants";
import CountdownTimer from "./countdown-timer";
import PaddleButton from "@/components/paddle-button";
import { PaddlePricing } from "@/components/paddle-pricing-component";

const LIFETIME_FEATURES = [
  "Everything in Creator Pro — forever",
  "Ghost Mode autopilot, unlimited",
  "Unlimited Content Vault",
  "All upcoming features (Comments, DMs, AI Studio)",
  "Founding Member badge on your profile",
  "Priority support — direct line to founder",
  "Lock in before prices rise",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Pricing() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/launch/spots")
      .then((r) => r.json())
      .then((d) => setSpotsLeft(d.remaining ?? null))
      .catch(() => setSpotsLeft(null));
  }, []);

  const spotsPercent =
    spotsLeft !== null ? Math.round(((100 - spotsLeft) / 100) * 100) : 0;

  return (
    <section
      ref={ref}
      id="pricing"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.04] blur-[120px]" />
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-amber-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Crown className="h-3.5 w-3.5" />
            Launch Week — Limited Spots
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="gradient-text">Join 100 Founding Members</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            Get lifetime access at a founder price — before we switch to monthly-only.
          </p>
        </motion.div>

        {/* ── Lifetime Deal Hero Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-10 relative"
        >
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-1.5 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
              <Crown className="h-3 w-3" />
              FOUNDING MEMBER — ONE-TIME DEAL
            </div>
          </div>

          <div className="relative rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-[#12121a] to-violet-600/[0.06] p-8 md:p-10 overflow-hidden">
            {/* Glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[80px]" />

            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {/* Left: Price + timer */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/40 mb-1">One-time payment · Yours forever</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-extrabold text-white">$99</span>
                    <div className="space-y-0.5">
                      <p className="text-sm text-white/30 line-through">$49/mo</p>
                      <p className="text-xs font-semibold text-amber-400">Never pay again</p>
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">
                    Offer ends in
                  </p>
                  <CountdownTimer />
                </div>

                {/* Spots bar */}
                <div className="w-full max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Spots claimed</span>
                    <span className="font-bold text-amber-400">
                      {spotsLeft !== null ? `${100 - spotsLeft}/100` : "—/100"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${spotsPercent}%` } : {}}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  {spotsLeft !== null && spotsLeft <= 20 && (
                    <p className="text-[10px] font-bold text-red-400">
                      ⚡ Only {spotsLeft} spots left!</p>
                  )}
                </div>
              </div>

              {/* Right: Features + CTA */}
              <div className="flex-1 max-w-sm space-y-4">
                <ul className="space-y-2.5">
                  {LIFETIME_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
                        <Check className="h-2.5 w-2.5 text-amber-400" />
                      </div>
                      <span className="text-sm text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <PaddleButton
                    priceId={process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME ?? "REPLACE_WITH_PRICE_ID"}
                    label="Get Lifetime Access — $99"
                    highlighted={true}
                    isLifetime={true}
                  />
                </div>

                {/* Referral teaser */}
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                  <Users className="h-4 w-4 shrink-0 text-violet-400" />
                  <p className="text-xs text-white/50">
                    <span className="font-semibold text-violet-400">Earn $5 per referral</span>
                    {" "}sent directly to your payout account during launch week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="relative mb-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-xs font-semibold text-white/25 uppercase tracking-widest whitespace-nowrap">
            Or choose a subscription plan
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* 3-Tier Paddle Pricing with Localized Prices & Monthly/Yearly Toggle */}
        <PaddlePricing country="OTHERS" />
      </div>
    </section>
  );
}
