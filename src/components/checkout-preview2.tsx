"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  CheckCircle2,
  Zap,
  CreditCard,
  QrCode,
  ArrowRight,
  Check,
  Tag,
  Star,
  ChevronDown,
  BadgeCheck,
  Fingerprint,
  RefreshCw,
  Sparkles,
  Users,
  Clock,
  Globe2,
  ShieldCheck,
  Award,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PaymentTab = "card" | "upi";

const TRUST_BADGES = [
  { icon: Shield, label: "SSL Secured", sub: "256-bit Encryption" },
  { icon: Fingerprint, label: "PCI DSS", sub: "Level 1 Certified" },
  { icon: RefreshCw, label: "14-Day Refund", sub: "No Questions Asked" },
  { icon: BadgeCheck, label: "Paddle MoR", sub: "Global Tax Handled" },
];

const SOCIAL_PROOF = [
  { name: "Ananya R.", handle: "@ananyacreates", avatar: "AR", plan: "Creator Pro", review: "Ghost Mode saved my engagement for 3 weeks while I was traveling. My account grew 12% on autopilot. Ghostal is a no-brainer.", stars: 5, country: "🇮🇳" },
  { name: "Jake M.", handle: "@jakemwrites", avatar: "JM", plan: "Starter", review: "Switched from Buffer after seeing Ghostal's vault system. The AI caption remix alone is worth the price.", stars: 5, country: "🇺🇸" },
];

const PLAN = {
  name: "Creator Pro",
  billing: "Annual Plan (20% Off)",
  monthlyEquivalent: "$23.20 / mo",
  price: 278.40,
  badge: "🏆 Most Popular",
  features: [
    "3 Instagram Accounts",
    "Unlimited Content Vault",
    "AI Caption Remix Engine",
    "Evergreen Resurrection",
    "Ghost Mode Autopilot",
    "30-Day Analytics Suite",
    "14-Day Free Trial — $0 Today",
  ],
};

export function CustomCheckoutPreview2() {
  const [tab, setTab] = useState<PaymentTab>("card");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("IN");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [showFAQ, setShowFAQ] = useState<number | null>(null);

  const raw = PLAN.price;
  const discAmt = (raw * discount) / 100;
  const total = Math.max(0, raw - discAmt);

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
    return digits;
  };

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg("");
    setCouponError(false);
    const code = coupon.trim().toUpperCase();
    if (["GHOST20", "LAUNCH20", "FOUNDER20"].includes(code)) {
      setDiscount(20);
      setCouponApplied(true);
      setCouponMsg("20% Launch Discount Applied!");
    } else if (["FREE100", "TEST100"].includes(code)) {
      setDiscount(100);
      setCouponApplied(true);
      setCouponMsg("100% Promo Applied — Free Access!");
    } else if (code) {
      setCouponError(true);
      setCouponMsg("Invalid code. Try GHOST20 for 20% off.");
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1800);
  };

  const faqs = [
    { q: "Will I be charged today?", a: "No. Your 14-day free trial starts immediately. You'll be charged $" + total.toFixed(2) + " on Day 15." },
    { q: "Can I cancel anytime?", a: "Yes. Cancel before Day 14 and you'll never be charged. No hidden fees, no questions." },
    { q: "What payment methods are supported?", a: "Credit/Debit cards (Visa, Mastercard, Amex, Apple Pay, Google Pay), and UPI." },
    { q: "Is my payment information secure?", a: "100%. All payments are processed by Paddle (PCI DSS Level 1), never stored on our servers." },
  ];

  if (done) {
    return (
      <div className="min-h-screen bg-[#06060e] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="max-w-lg w-full"
        >
          {/* Success card */}
          <div className="relative rounded-[2rem] overflow-hidden border border-emerald-500/30 bg-[#0a0a16] shadow-2xl shadow-emerald-500/10">
            {/* Top gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400 mb-3">
                <Sparkles className="h-3 w-3" /> Trial Activated — 14 Days Free
              </div>
              <h2 className="text-3xl font-black text-white mt-1">
                You&apos;re in, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{name || "Creator"}!</span>
              </h2>
              <p className="text-sm text-white/50 mt-2 leading-relaxed">
                Your <strong className="text-white">Creator Pro Annual</strong> trial is active.<br />Ghost Mode autopilot has been provisioned.
              </p>

              {/* Receipt box */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left space-y-3 text-xs">
                {[
                  { label: "Plan", value: "Creator Pro — Annual" },
                  { label: "Trial Ends", value: "14 days from today" },
                  { label: "First Charge", value: `$${total.toFixed(2)} on Day 15` },
                  { label: "Email", value: email || "creator@ghostal.xyz" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-white/40">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard"
                className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="h-4 w-4 fill-current" /> Launch Your Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 text-[10px] text-white/30">
                A confirmation receipt has been sent to your email.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#06060e] text-white overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-violet-700/8 blur-[200px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-600/6 blur-[160px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/6 blur-[160px]" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Sticky Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06060e]/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
              <Zap className="h-4.5 w-4.5 text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">Ghostal</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-[11px] font-semibold text-white/50">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure Checkout
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-violet-400" />
              256-bit SSL
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              PCI DSS Level 1
            </div>
          </div>

          <div className="text-[11px] text-white/40 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span><strong className="text-white">2,847</strong> creators joined this week</span>
          </div>
        </div>
      </nav>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 lg:py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-1.5 text-[11px] font-bold text-violet-300 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            14-Day Free Trial · No Charges Today · Cancel Anytime
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Complete Your Order
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-sm mx-auto">
            You&apos;re 2 minutes away from automated Instagram growth on autopilot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ═══ LEFT: Order Summary + Trust ═══ */}
          <div className="lg:col-span-5 space-y-5">

            {/* Order Summary Card */}
            <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0b0b17]">
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400" />

              <div className="p-6">
                {/* Plan header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Selected Plan</div>
                    <h3 className="text-xl font-black text-white">{PLAN.name}</h3>
                    <p className="text-[11px] text-white/50 mt-0.5">{PLAN.billing}</p>
                  </div>
                  <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-400 whitespace-nowrap">
                    {PLAN.badge}
                  </span>
                </div>

                {/* Feature checklist */}
                <ul className="space-y-2.5 mb-6">
                  {PLAN.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
                        <Check className="h-3 w-3 text-violet-400" strokeWidth={3} />
                      </div>
                      <span className="text-xs text-white/75">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Price breakdown */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>Creator Pro (Annual)</span>
                    <span className="text-white">${PLAN.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/50">
                    <span>Annual Discount (20%)</span>
                    <span className="text-emerald-400">−$69.60</span>
                  </div>
                  {couponApplied && discount > 0 && (
                    <div className="flex justify-between text-xs text-white/50">
                      <span>Promo Code ({coupon.toUpperCase()})</span>
                      <span className="text-emerald-400">−${discAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-2.5 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Total Due Today</span>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">$0.00</div>
                      <div className="text-[10px] text-white/40">Then ${total.toFixed(2)} / year from Day 15</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-white/40 pt-1">
                    <span>That&apos;s just {PLAN.monthlyEquivalent}</span>
                    <span>+ applicable local taxes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-2 gap-3">
              {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#0b0b17] p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">{label}</p>
                    <p className="text-[10px] text-white/40">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-3">
              {SOCIAL_PROOF.map((t) => (
                <div key={t.name} className="rounded-2xl border border-white/[0.07] bg-[#0b0b17] p-4">
                  <div className="flex items-center gap-1 text-amber-400 mb-2">
                    {[...Array(t.stars)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                    <span className="ml-auto text-[10px] text-white/30">{t.country} Verified Buyer</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed italic">&ldquo;{t.review}&rdquo;</p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[9px] font-black text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">{t.name}</p>
                      <p className="text-[10px] text-white/35">{t.handle} · {t.plan}</p>
                    </div>
                    <BadgeCheck className="ml-auto h-4 w-4 text-cyan-400" />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Activity Ticker */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-300/80">
                <strong className="text-emerald-300">14 people</strong> started their trial in the last hour.
              </p>
            </div>
          </div>

          {/* ═══ RIGHT: Payment Form ═══ */}
          <div className="lg:col-span-7 space-y-5">

            {/* Step Progress */}
            <div className="flex items-center gap-3 mb-2">
              {[{ n: 1, label: "Your Details" }, { n: 2, label: "Payment" }].map(({ n, label }, i) => (
                <div key={n} className="flex items-center gap-2">
                  <button
                    onClick={() => step >= n && setStep(n as 1 | 2)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all cursor-pointer",
                      step >= n
                        ? "bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25"
                        : "bg-white/10 text-white/30"
                    )}
                  >
                    {step > n ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
                  </button>
                  <span className={cn("text-xs font-bold", step >= n ? "text-white" : "text-white/30")}>
                    {label}
                  </span>
                  {i < 1 && <div className={cn("flex-1 h-px mx-2 w-12 transition-all", step > 1 ? "bg-violet-500" : "bg-white/10")} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Contact Details ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl border border-white/[0.08] bg-[#0b0b17] p-6 sm:p-8 space-y-5"
                >
                  <div>
                    <h3 className="text-lg font-black text-white mb-1">Tell us a bit about you</h3>
                    <p className="text-xs text-white/40">We&apos;ll send your receipt and trial info here.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/25 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1.5 uppercase tracking-wide">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="alex@domain.com"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/25 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1.5 uppercase tracking-wide">Country</label>
                      <div className="relative">
                        <Globe2 className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-white/30" />
                        <select
                          value={country}
                          onChange={e => setCountry(e.target.value)}
                          className="w-full appearance-none rounded-2xl border border-white/10 bg-[#11111e] pl-10 pr-10 py-3.5 text-sm text-white focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all cursor-pointer"
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
                  </div>

                  {/* Promo code */}
                  <form onSubmit={applyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
                      <input
                        value={coupon}
                        onChange={e => { setCoupon(e.target.value); setCouponMsg(""); setCouponError(false); }}
                        placeholder="Promo code (try GHOST20)"
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-3 text-xs text-white placeholder-white/25 uppercase tracking-wider focus:border-violet-500/70 focus:outline-none transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/10 px-5 text-xs font-black text-white transition-all cursor-pointer whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </form>
                  {couponMsg && (
                    <p className={cn("text-[11px] font-bold -mt-2", couponError ? "text-red-400" : "text-emerald-400")}>
                      {couponError ? "✕" : "✓"} {couponMsg}
                    </p>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-500/25 transition-all hover:scale-[1.02] hover:shadow-violet-500/40 active:scale-[0.98] cursor-pointer"
                  >
                    Continue to Payment <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-[10px] text-white/30">
                    By continuing you agree to our <Link href="/terms" className="text-violet-400 hover:underline">Terms</Link> and <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>.
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: Payment ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl border border-white/[0.08] bg-[#0b0b17] p-6 sm:p-8 space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-black text-white mb-1">Payment Method</h3>
                    <p className="text-xs text-white/40">Your card info is never stored on our servers.</p>
                  </div>

                  {/* Payment Tabs */}
                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5">
                    {([
                      { key: "card", icon: CreditCard, label: "Card" },
                      { key: "upi", icon: QrCode, label: "UPI" },
                    ] as { key: PaymentTab; icon?: React.ElementType; label: string }[]).map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer",
                          tab === key
                            ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md"
                            : "text-white/50 hover:text-white"
                        )}
                      >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {tab === "card" && (
                      <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-white/50 mb-1.5 uppercase tracking-wide">Card Number</label>
                          <div className="relative">
                            <input
                              value={cardNumber}
                              onChange={e => setCardNumber(formatCard(e.target.value))}
                              placeholder="4242 4242 4242 4242"
                              maxLength={19}
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all tracking-wider"
                            />
                            <div className="absolute right-4 top-3 flex gap-1.5 opacity-40">
                              {["VISA", "MC"].map(b => (
                                <span key={b} className="text-[10px] font-black text-white border border-white/20 rounded px-1">{b}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-white/50 mb-1.5 uppercase tracking-wide">Expiry Date</label>
                            <input
                              value={expiry}
                              onChange={e => setExpiry(formatExpiry(e.target.value))}
                              placeholder="MM / YY"
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-white/50 mb-1.5 uppercase tracking-wide">CVC / CVV</label>
                            <input
                              type="password"
                              value={cvc}
                              onChange={e => setCvc(e.target.value.slice(0, 4))}
                              placeholder="•••"
                              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all tracking-widest"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5">
                          <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <p className="text-[11px] text-emerald-400/80">Secured by Paddle · PCI DSS Level 1 · Your card is never stored</p>
                        </div>
                      </motion.div>
                    )}

                    {tab === "upi" && (
                      <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-white/50 mb-1.5 uppercase tracking-wide">UPI / VPA Address</label>
                          <input
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            placeholder="yourname@okaxis"
                            className="w-full rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] px-4 py-3.5 text-sm text-white placeholder-white/20 focus:border-cyan-500/50 focus:outline-none transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {["GPay", "PhonePe", "Paytm", "BHIM"].map(app => (
                            <div key={app} className="rounded-xl border border-white/[0.07] bg-white/[0.025] py-2.5 text-[10px] font-bold text-white/60">
                              {app}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3.5 py-2.5">
                          <Fingerprint className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <p className="text-[11px] text-cyan-400/80">UPI AutoPay Mandate — biometric verification in your UPI app</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Name on card / billing address hint */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/50 space-y-1.5">
                    <p className="font-bold text-white/70 mb-2">Billing Summary</p>
                    <div className="flex justify-between"><span>Name</span><span className="text-white">{name || "—"}</span></div>
                    <div className="flex justify-between"><span>Email</span><span className="text-white">{email || "—"}</span></div>
                    <div className="flex justify-between"><span>Today&apos;s Charge</span><span className="font-black text-emerald-400 text-sm">$0.00</span></div>
                    <div className="flex justify-between"><span>After 14-Day Trial</span><span className="text-white">${total.toFixed(2)} / year</span></div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 py-4.5 py-[18px] text-[15px] font-extrabold text-white shadow-2xl shadow-violet-500/30 transition-all hover:scale-[1.02] hover:shadow-violet-500/40 active:scale-[0.98] cursor-pointer disabled:opacity-70"
                  >
                    <Zap className="h-5 w-5 fill-current text-amber-300" />
                    {submitting ? "Activating Trial…" : "Start Free Trial — $0.00 Today"}
                  </button>

                  <div className="flex items-center justify-center gap-6 text-[10px] text-white/30">
                    <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> 256-bit SSL</span>
                    <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> 14-Day Refund</span>
                    <span className="flex items-center gap-1"><Award className="h-3 w-3" /> Cancel Anytime</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ Accordion */}
            <div className="rounded-3xl border border-white/[0.07] bg-[#0b0b17] p-6 space-y-1">
              <h4 className="text-sm font-black text-white mb-4">Frequently Asked Questions</h4>
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-white/[0.05] last:border-0">
                  <button
                    onClick={() => setShowFAQ(showFAQ === i ? null : i)}
                    className="flex w-full items-center justify-between py-3.5 text-left text-xs font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    {faq.q}
                    <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-white/30 transition-transform", showFAQ === i && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {showFAQ === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-4 text-[11px] text-white/50 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-[11px] text-white/30">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400 fill-current" />
            <span className="font-bold text-white/50">Ghostal</span>
            <span>· All rights reserved</span>
          </div>
          <div className="flex items-center gap-4">
            {["Terms", "Privacy", "Refunds", "Contact"].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} className="hover:text-white/60 transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Payments secured by <strong className="text-white/50">Paddle</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
