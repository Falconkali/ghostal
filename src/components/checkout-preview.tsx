"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Sparkles,
  Zap,
  CreditCard,
  QrCode,
  ArrowRight,
  Check,
  Tag,
  Star,
  Globe2,
  BadgeCheck,
  RefreshCw,
  Fingerprint,
  Award,
  ChevronDown,
  Crown,
  Flame,
  Users,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PlanKey = "lifetime" | "pro" | "starter";
type Cycle = "month" | "year";
type PayTab = "card" | "upi";

// ─── Plan Config ──────────────────────────────────────────────────────────────
const PLANS: Record<
  PlanKey,
  {
    name: string;
    tagline: string;
    icon: React.ElementType;
    iconColor: string;
    badge: string;
    badgeColor: string;
    monthPrice: number | null;
    yearPrice: number | null;
    isLifetime: boolean;
    gradient: string;
    borderColor: string;
    features: string[];
    trial: string | null;
  }
> = {
  lifetime: {
    name: "Founding Member",
    tagline: "One payment. Yours forever.",
    icon: Crown,
    iconColor: "text-amber-400",
    badge: "🔥 Limited — 100 Spots",
    badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    monthPrice: null,
    yearPrice: null,
    isLifetime: true,
    gradient: "from-amber-600 via-orange-500 to-yellow-500",
    borderColor: "border-amber-500/25",
    features: [
      "Everything in Creator Pro — forever",
      "Unlimited Content Vault & Ghost Mode",
      "All upcoming AI features (DMs, AI Studio)",
      "Founding Member profile badge",
      "Direct founder priority support",
      "Lock in before prices rise",
    ],
    trial: null,
  },
  pro: {
    name: "Creator Pro",
    tagline: "Full automation suite for growing creators.",
    icon: Flame,
    iconColor: "text-violet-400",
    badge: "🏆 Most Popular",
    badgeColor: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    monthPrice: 29,
    yearPrice: 278.4,
    isLifetime: false,
    gradient: "from-violet-600 via-fuchsia-600 to-cyan-500",
    borderColor: "border-violet-500/25",
    features: [
      "3 Instagram Accounts Sync",
      "Unlimited Content Vault Storage",
      "AI Caption Tone Remix Engine",
      "Evergreen Post Resurrection",
      "Advanced 30-Day Analytics & Insights",
      "Priority Email Support",
    ],
    trial: "14-Day Free Trial",
  },
  starter: {
    name: "Starter",
    tagline: "Essential autopilot for solo creators.",
    icon: Zap,
    iconColor: "text-cyan-400",
    badge: "✨ Solo Creators",
    badgeColor: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    monthPrice: 9,
    yearPrice: 86.4,
    isLifetime: false,
    gradient: "from-cyan-600 via-teal-500 to-emerald-500",
    borderColor: "border-cyan-500/25",
    features: [
      "1 Instagram Account Sync",
      "Content Vault (Up to 50 assets)",
      "Ghost Mode Autopilot Radar",
      "Meta Graph API v19 Compliance",
      "Email Support",
    ],
    trial: "14-Day Free Trial",
  },
};

const TRUST = [
  { icon: Shield, label: "256-bit SSL", sub: "Encrypted" },
  { icon: Fingerprint, label: "PCI DSS", sub: "Level 1" },
  { icon: RefreshCw, label: "14-Day", sub: "Money Back" },
  { icon: BadgeCheck, label: "Paddle", sub: "Merchant of Record" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function fmtExp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + " / " + d.slice(2) : d;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CustomCheckoutPreview() {
  const [plan, setPlan] = useState<PlanKey>("pro");
  const [cycle, setCycle] = useState<Cycle>("year");
  const [payTab, setPayTab] = useState<PayTab>("card");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("IN");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [upi, setUpi] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [couponOk, setCouponOk] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const p = PLANS[plan];

  const rawPrice = p.isLifetime
    ? 99
    : cycle === "year"
    ? (p.yearPrice ?? 0)
    : (p.monthPrice ?? 0);

  const discAmt = (rawPrice * discount) / 100;
  const finalPrice = Math.max(0, rawPrice - discAmt);
  const todayCharge = p.trial ? 0 : finalPrice;

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    const valid20 = ["GHOST20", "LAUNCH20", "FOUNDER20"];
    const valid100 = ["FREE100", "TEST100"];
    if (valid20.includes(code)) {
      setDiscount(20); setCouponOk(true); setCouponMsg("🎉 20% discount applied!");
    } else if (valid100.includes(code)) {
      setDiscount(100); setCouponOk(true); setCouponMsg("🎉 100% off — Free access!");
    } else {
      setCouponOk(false); setCouponMsg("Invalid code. Try GHOST20 for 20% off.");
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1800);
  };

  // ── Success Screen ──
  if (done) {
    return (
      <div className="min-h-screen bg-[#06060e] text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="max-w-md w-full"
        >
          <div className={`h-1.5 w-full rounded-t-3xl bg-gradient-to-r ${p.gradient}`} />
          <div className="rounded-b-3xl border border-t-0 border-white/[0.08] bg-[#0b0b17] p-8 text-center shadow-2xl">
            <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${p.gradient} shadow-2xl`}>
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 mb-3">
              <Sparkles className="h-3 w-3" />
              {p.trial ? "Trial Activated" : "Payment Successful"}
            </div>
            <h2 className="text-3xl font-black text-white mt-1">
              Welcome, <span className={`bg-gradient-to-r ${p.gradient} bg-clip-text text-transparent`}>{name || "Creator"}!</span>
            </h2>
            <p className="text-sm text-white/50 mt-2 leading-relaxed">
              Your <strong className="text-white">{p.name}</strong> plan is now active.<br />Ghost Mode has been provisioned for your account.
            </p>
            <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left space-y-3 text-xs">
              {[
                { l: "Plan", v: `${p.name} ${!p.isLifetime ? `(${cycle === "year" ? "Annual" : "Monthly"})` : "(Lifetime)"}` },
                { l: "Email", v: email || "—" },
                { l: "Charged Today", v: p.trial ? "$0.00" : `$${finalPrice.toFixed(2)}` },
                ...(p.trial ? [{ l: "First Billing", v: `$${finalPrice.toFixed(2)} on Day 15` }] : []),
              ].map(({ l, v }) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-white/40">{l}</span>
                  <span className="font-bold text-white">{v}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${p.gradient} py-4 text-sm font-extrabold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <Zap className="h-4 w-4 fill-current" /> Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-[10px] text-white/30">Confirmation sent to your email.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#06060e] text-white overflow-hidden">

      {/* ── Ambient Background ── */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-violet-700/7 blur-[220px]" />
        <div className="absolute bottom-[-50px] right-0 h-[500px] w-[500px] rounded-full bg-cyan-600/6 blur-[180px]" />
        <div className="absolute bottom-[-50px] left-0 h-[500px] w-[500px] rounded-full bg-fuchsia-600/5 blur-[180px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#06060e]/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
              <Zap className="h-[18px] w-[18px] text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight">Ghostal</span>
          </Link>
          <div className="hidden sm:flex items-center gap-5 text-[11px] text-white/40 font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure Checkout
            </span>
            <span className="flex items-center gap-1.5"><Lock className="h-3 w-3 text-violet-400" />256-bit SSL</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-cyan-400" />PCI DSS</span>
          </div>
          <div className="text-[11px] text-white/40 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span><strong className="text-white">2,847</strong> joined this week</span>
          </div>
        </div>
      </nav>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-14">

        {/* ── Page Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/8 px-4 py-1.5 text-[11px] font-bold text-violet-300 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Trusted by 2,800+ Instagram Creators Worldwide
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Choose Your Plan &amp;{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Start Growing
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/50 max-w-md mx-auto">
            All subscription plans include a <strong className="text-white">14-day free trial</strong>. No charges today.
          </p>
        </div>

        {/* ── Plan Selector Pills ── */}
        <div className="flex justify-center mb-8">
          <div className="inline-grid grid-cols-3 gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0b0b17] p-1.5 shadow-xl">
            {(Object.keys(PLANS) as PlanKey[]).map((key) => {
              const pl = PLANS[key];
              const Icon = pl.icon;
              const active = plan === key;
              return (
                <button
                  key={key}
                  onClick={() => setPlan(key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                    active
                      ? `bg-gradient-to-r ${pl.gradient} text-white shadow-lg`
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", active ? "text-white" : pl.iconColor)} />
                  {pl.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Billing Cycle Toggle (hidden for lifetime) ── */}
        <AnimatePresence>
          {!p.isLifetime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#0b0b17] p-1.5">
                <button
                  onClick={() => setCycle("month")}
                  className={cn(
                    "rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer",
                    cycle === "month"
                      ? "bg-white/10 text-white"
                      : "text-white/40 hover:text-white"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setCycle("year")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer",
                    cycle === "year"
                      ? `bg-gradient-to-r ${p.gradient} text-white shadow-md`
                      : "text-white/40 hover:text-white"
                  )}
                >
                  Annual
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-black text-emerald-400">
                    SAVE 20%
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Two-Column Layout ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={plan + cycle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >

            {/* ═══ LEFT: Plan Details ═══ */}
            <div className="lg:col-span-5 space-y-5">

              {/* Plan card */}
              <div className={cn("relative overflow-hidden rounded-3xl border bg-[#0b0b17]", p.borderColor)}>
                {/* Gradient bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${p.gradient}`} />

                {/* Subtle corner glow */}
                <div className={`pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${p.gradient} opacity-10 blur-3xl`} />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} shadow-xl`}>
                        <p.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">{p.name}</h3>
                        <p className="text-[11px] text-white/50 mt-0.5">{p.tagline}</p>
                      </div>
                    </div>
                    <span className={cn("rounded-xl border px-2.5 py-1 text-[10px] font-black whitespace-nowrap", p.badgeColor)}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-5xl font-black text-white">
                      ${p.isLifetime ? "99" : finalPrice.toFixed(2)}
                    </span>
                    <div className="text-xs text-white/40 leading-tight">
                      <div>{p.isLifetime ? "one-time" : cycle === "year" ? "/ year" : "/ month"}</div>
                      {!p.isLifetime && cycle === "year" && (
                        <div className="text-emerald-400 font-bold">≈ ${(finalPrice / 12).toFixed(2)}/mo</div>
                      )}
                    </div>
                    {p.trial && (
                      <div className="ml-auto rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-center">
                        <div className="text-[10px] font-black text-emerald-400">FREE</div>
                        <div className="text-[9px] text-emerald-400/60">14 days</div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 border-t border-white/[0.06] pt-5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${p.gradient} shadow-md`}>
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-xs text-white/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0b0b17] p-4 space-y-2.5 text-xs">
                <p className="font-bold text-white/70 text-[11px] uppercase tracking-wide mb-3">Price Breakdown</p>
                {!p.isLifetime && (
                  <div className="flex justify-between text-white/50">
                    <span>{p.name} ({cycle === "year" ? "Annual" : "Monthly"})</span>
                    <span className="text-white">${p.isLifetime ? "99.00" : (cycle === "year" ? ((p.monthPrice ?? 0) * 12).toFixed(2) : (p.monthPrice ?? 0).toFixed(2))}</span>
                  </div>
                )}
                {!p.isLifetime && cycle === "year" && (
                  <div className="flex justify-between text-white/50">
                    <span>Annual Discount (20%)</span>
                    <span className="text-emerald-400">−${(((p.monthPrice ?? 0) * 12) - (p.yearPrice ?? 0)).toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-white/50">
                    <span>Promo Code ({coupon.toUpperCase()})</span>
                    <span className="text-emerald-400">−${discAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2.5 flex justify-between items-end">
                  <span className="font-bold text-white">Due Today</span>
                  <div className="text-right">
                    <div className={cn("text-2xl font-black", todayCharge === 0 ? "text-emerald-400" : "text-white")}>
                      ${todayCharge === 0 ? "0.00" : todayCharge.toFixed(2)}
                    </div>
                    {p.trial && (
                      <div className="text-[10px] text-white/40">Then ${finalPrice.toFixed(2)} on Day 15</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-4 gap-2">
                {TRUST.map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1 rounded-2xl border border-white/[0.06] bg-[#0b0b17] py-3 px-2 text-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} shadow-md opacity-90`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[10px] font-black text-white">{label}</p>
                    <p className="text-[9px] text-white/35 leading-tight">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#0b0b17] p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-current" />)}
                  <span className="ml-auto text-[10px] text-white/30">🇮🇳 Verified Buyer</span>
                </div>
                <p className="text-xs text-white/70 italic leading-relaxed">
                  &ldquo;Ghost Mode saved my Instagram account while I was on a 3-week trip. Posts went out daily — 12% growth on autopilot. Best SaaS purchase I made this year.&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-[10px] font-black text-white`}>
                    AR
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Ananya R.</p>
                    <p className="text-[10px] text-white/35">@ananyacreates · Creator Pro</p>
                  </div>
                  <BadgeCheck className="ml-auto h-4 w-4 text-cyan-400" />
                </div>
              </div>
            </div>

            {/* ═══ RIGHT: Payment Form ═══ */}
            <div ref={formRef} className="lg:col-span-7 space-y-5">
              <div className="rounded-3xl border border-white/[0.08] bg-[#0b0b17] overflow-hidden">
                {/* Form top bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${p.gradient}`} />

                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-white">Your Details</h3>
                    <p className="text-xs text-white/40 mt-0.5">Your information is never shared or sold.</p>
                  </div>

                  {/* Contact fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">Full Name</label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">Country / Region</label>
                    <div className="relative">
                      <Globe2 className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                      <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full appearance-none rounded-2xl border border-white/10 bg-[#11111e] pl-10 pr-10 py-3 text-sm text-white focus:border-violet-500/60 focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="IN">🇮🇳 India</option>
                        <option value="US">🇺🇸 United States</option>
                        <option value="GB">🇬🇧 United Kingdom</option>
                        <option value="CA">🇨🇦 Canada</option>
                        <option value="DE">🇩🇪 Germany</option>
                        <option value="AU">🇦🇺 Australia</option>
                        <option value="SG">🇸🇬 Singapore</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-white/30" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/[0.06]" />

                  {/* Payment Method */}
                  <div>
                    <h4 className="text-sm font-black text-white mb-1">Payment Method</h4>
                    <p className="text-xs text-white/40 mb-4">Your card details are never stored on our servers.</p>

                    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5">
                      {([
                        { key: "card" as PayTab, icon: CreditCard, label: "Card" },
                        { key: "upi" as PayTab, icon: QrCode, label: "UPI" },
                      ]).map(({ key, icon: Icon, label }) => (
                        <button
                          key={key}
                          onClick={() => setPayTab(key)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer",
                            payTab === key
                              ? `bg-gradient-to-r ${p.gradient} text-white shadow-md`
                              : "text-white/50 hover:text-white"
                          )}
                        >
                          {Icon && <Icon className="h-3.5 w-3.5" />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Fields */}
                  <AnimatePresence mode="wait">
                    {payTab === "card" && (
                      <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">Card Number</label>
                          <div className="relative">
                            <input
                              value={card}
                              onChange={e => setCard(fmtCard(e.target.value))}
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 tracking-wider focus:border-violet-500/60 focus:outline-none transition-all"
                            />
                            <div className="absolute right-4 top-3 flex gap-1 opacity-40">
                              {["VISA", "MC", "AMEX"].map(b => (
                                <span key={b} className="text-[9px] font-black text-white border border-white/20 rounded px-1 py-0.5">{b}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">Expiry</label>
                            <input
                              value={exp}
                              onChange={e => setExp(fmtExp(e.target.value))}
                              placeholder="MM / YY"
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-violet-500/60 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">CVC / CVV</label>
                            <input
                              type="password"
                              value={cvc}
                              onChange={e => setCvc(e.target.value.slice(0, 4))}
                              placeholder="•••"
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 tracking-widest focus:border-violet-500/60 focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5">
                          <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px] text-emerald-400/80">Secured by Paddle · PCI DSS Level 1 Certified</span>
                        </div>
                      </motion.div>
                    )}
                    {payTab === "upi" && (
                      <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">UPI / VPA Address</label>
                          <input
                            value={upi}
                            onChange={e => setUpi(e.target.value)}
                            placeholder="username@okaxis"
                            className="w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                            <div key={app} className="rounded-xl border border-white/[0.06] bg-white/[0.025] py-2.5 text-[10px] font-bold text-white/60">{app}</div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3.5 py-2.5">
                          <Fingerprint className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span className="text-[11px] text-cyan-400/80">UPI AutoPay Mandate — biometric authentication in your app</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Promo Code */}
                  <div className="border-t border-white/[0.06] pt-5">
                    <form onSubmit={applyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-white/30" />
                        <input
                          value={coupon}
                          onChange={e => { setCoupon(e.target.value); setCouponMsg(""); }}
                          placeholder="Promo code (try GHOST20)"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-3 text-xs text-white placeholder-white/25 uppercase tracking-wider focus:border-violet-500/60 focus:outline-none transition-all"
                        />
                      </div>
                      <button type="submit" className="rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/10 px-5 text-xs font-black text-white transition-all cursor-pointer">
                        Apply
                      </button>
                    </form>
                    {couponMsg && (
                      <p className={cn("mt-1.5 text-[11px] font-bold", couponOk ? "text-emerald-400" : "text-red-400")}>
                        {couponOk ? "✓" : "✕"} {couponMsg}
                      </p>
                    )}
                  </div>

                  {/* Billing Summary */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs space-y-2">
                    <p className="font-bold text-white/70 uppercase tracking-wide text-[10px] mb-2">Billing Summary</p>
                    {[
                      { l: "Name", v: name || "—" },
                      { l: "Email", v: email || "—" },
                      { l: "Plan", v: `${p.name} ${!p.isLifetime ? `(${cycle === "year" ? "Annual" : "Monthly"})` : "(Lifetime)"}` },
                      { l: "Due Today", v: todayCharge === 0 ? "$0.00 (Trial)" : `$${todayCharge.toFixed(2)}` },
                    ].map(({ l, v }) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-white/40">{l}</span>
                        <span className="font-semibold text-white">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={cn(
                      "w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-[15px] font-extrabold text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60",
                      `bg-gradient-to-r ${p.gradient} shadow-violet-500/25`
                    )}
                  >
                    <Zap className="h-5 w-5 fill-current text-white/90" />
                    {submitting
                      ? "Activating…"
                      : p.trial
                      ? `Start 14-Day Trial — $0.00 Today`
                      : `Complete Purchase — $${finalPrice.toFixed(2)}`}
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-5 text-[10px] text-white/30">
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" />256-bit SSL</span>
                    <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" />14-Day Refund</span>
                    <span className="flex items-center gap-1"><Award className="h-3 w-3" />Cancel Anytime</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Tax Handled by Paddle</span>
                  </div>
                </div>
              </div>

              {/* As Seen In / Powered By strip */}
              <div className="rounded-2xl border border-white/[0.06] bg-[#0b0b17] p-4 flex flex-wrap items-center justify-center gap-6 text-[10px] text-white/25 font-bold uppercase tracking-widest">
                <span>Powered by Paddle</span>
                <span className="h-3 w-px bg-white/10" />
                <span>Meta Graph API v21</span>
                <span className="h-3 w-px bg-white/10" />
                <span>Vercel Edge Network</span>
                <span className="h-3 w-px bg-white/10" />
                <span>Supabase Auth</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.05] pt-8 text-[11px] text-white/30">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400 fill-current" />
            <span className="font-bold text-white/50">Ghostal</span>
            <span>· © 2026 All rights reserved</span>
          </div>
          <div className="flex items-center gap-4">
            {["Terms", "Privacy", "Refunds", "Contact"].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} className="hover:text-white/60 transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Payments by <strong className="text-white/50">Paddle</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
