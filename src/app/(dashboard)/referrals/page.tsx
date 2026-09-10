"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Copy,
  Check,
  DollarSign,
  Clock,
  CheckCircle2,
  ExternalLink,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

interface Referral {
  id: string;
  referred_email: string | null;
  status: "pending" | "converted" | "paid";
  payout_amount: number;
  created_at: string;
  paid_at: string | null;
}

interface Stats {
  totalReferrals: number;
  converted: number;
  totalEarned: number;
  referralCode: string | null;
  paypalEmail: string | null;
}

const HOW_IT_WORKS = [
  {
    icon: Copy,
    title: "Copy your link",
    desc: "Share your unique referral link with anyone.",
  },
  {
    icon: Users,
    title: "They sign up & pay",
    desc: "When they take any paid plan, it counts.",
  },
  {
    icon: DollarSign,
    title: "You get $5 payout",
    desc: "We send $5 directly to your payout email within 48h.",
  },
];

export default function ReferralsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalReferrals: 0,
    converted: 0,
    totalEarned: 0,
    referralCode: null,
    paypalEmail: null,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const [paypalInput, setPaypalInput] = useState("");
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalSaved, setPaypalSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      // Generate referral code if user doesn't have one
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, paypal_email, referral_earnings")
        .eq("id", user!.id)
        .single();

      let code = profile?.referral_code;
      if (!code) {
        // Generate one
        code = user!.id.replace(/-/g, "").substring(0, 8).toUpperCase();
        await supabase
          .from("profiles")
          .update({ referral_code: code })
          .eq("id", user!.id);
      }

      // Load referrals
      const { data: refs } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });

      const converted = (refs ?? []).filter(
        (r) => r.status === "converted" || r.status === "paid"
      ).length;

      setStats({
        totalReferrals: refs?.length ?? 0,
        converted,
        totalEarned: profile?.referral_earnings ?? 0,
        referralCode: code,
        paypalEmail: profile?.paypal_email ?? null,
      });
      setPaypalInput(profile?.paypal_email ?? "");
      setReferrals((refs as Referral[]) ?? []);
    } catch (err) {
      console.error("Error loading referral data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function savePaypalEmail() {
    if (!paypalInput || !paypalInput.includes("@")) return;
    setSavingPaypal(true);
    await supabase
      .from("profiles")
      .update({ paypal_email: paypalInput })
      .eq("id", user!.id);
    setStats((s) => ({ ...s, paypalEmail: paypalInput }));
    setSavingPaypal(false);
    setPaypalSaved(true);
    setTimeout(() => setPaypalSaved(false), 3000);
  }

  const referralLink = stats.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : "https://ghostal.xyz"}/signup?ref=${stats.referralCode}`
    : "";

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusConfig = {
    pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
    converted: { label: "Converted ✅", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    paid: { label: "Paid 💸", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: DollarSign },
  };

  return (
    <div className="min-h-screen space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Referrals
          </h1>
        </div>
        <p className="text-sm text-zinc-500 pl-12">
          Earn $5 to your PayPal for every friend who takes a paid plan.
        </p>
      </motion.div>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-emerald-600/5 blur-[120px] -z-10" />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-5">

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { label: "Total Referrals", value: stats.totalReferrals, icon: Users, color: "text-violet-400" },
                { label: "Converted", value: stats.converted, icon: CheckCircle2, color: "text-emerald-400" },
                { label: "Total Earned", value: `$${stats.totalEarned.toFixed(2)}`, icon: DollarSign, color: "text-amber-400" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/[0.06] bg-[#0d0c18]/80 p-4 space-y-2"
                >
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Referral Link Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0d0c18]/80 p-5 space-y-3"
            >
              <p className="text-sm font-semibold text-white">Your Referral Link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 font-mono text-xs text-zinc-400 truncate">
                  {referralLink || "Generating link…"}
                </div>
                <button
                  onClick={copyLink}
                  disabled={!referralLink}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5" /> Copied!</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-zinc-600">
                Share this link. When someone signs up and pays via your link, you earn $5 — sent to your PayPal within 48 hours.
              </p>
            </motion.div>

            {/* Referral Table */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0d0c18]/80 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/[0.05]">
                <p className="text-sm font-semibold text-white">Referral History</p>
              </div>
              {referrals.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-600">No referrals yet — share your link to start earning!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {referrals.map((r) => {
                    const cfg = statusConfig[r.status] ?? statusConfig.pending;
                    const Icon = cfg.icon;
                    return (
                      <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                        <div>
                          <p className="text-sm text-white font-medium">
                            {r.referred_email ?? "Anonymous signup"}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* PayPal Email */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0d0c18]/80 p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-white">Payout Email</p>
              </div>

              {!stats.paypalEmail && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-400/80">Add your payout email to receive your referral rewards.</p>
                </div>
              )}

              <div className="space-y-2">
                <input
                  type="email"
                  value={paypalInput}
                  onChange={(e) => setPaypalInput(e.target.value)}
                  placeholder="your-email@domain.com"
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-violet-500/40 focus:outline-none"
                />
                <button
                  onClick={savePaypalEmail}
                  disabled={savingPaypal || !paypalInput}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50"
                >
                  {savingPaypal ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : paypalSaved ? (
                    <><Check className="h-3.5 w-3.5" /> Saved!</>
                  ) : (
                    "Save Payout Email"
                  )}
                </button>
              </div>
              <p className="text-[10px] text-zinc-700">
                Payouts are sent within 48 hours of a successful referral conversion. Minimum 1 conversion required.
              </p>
            </motion.div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0d0c18]/80 p-5 space-y-4"
            >
              <p className="text-sm font-semibold text-white">How It Works</p>
              <div className="space-y-4">
                {HOW_IT_WORKS.map((step, i) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{step.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="/#pricing"
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View launch offer
              </a>
            </motion.div>

            {/* Launch week notice */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-4 space-y-1"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <p className="text-xs font-bold text-amber-400">Launch Week Only</p>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                The $5 PayPal payout per referral is only available during launch week (ends July 6, 2026). After that, referral terms may change.
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
