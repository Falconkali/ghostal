"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, BarChart3, Upload, User, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";

interface IntegrationRequiredProps {
  pageName: string;
  description?: string;
}

/* ── Instagram SVG icon ─────────────────────────────── */
function InstagramIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-a" cx="30%" cy="107%" r="140%">
          <stop offset="0%"   stopColor="#ffd676" />
          <stop offset="25%"  stopColor="#f4700a" />
          <stop offset="50%"  stopColor="#e1306c" />
          <stop offset="75%"  stopColor="#833ab4" />
          <stop offset="100%" stopColor="#5851db" />
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ig-a)" />
      <rect x="12" y="12" width="24" height="24" rx="6.5" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="6" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="33.5" cy="14.5" r="1.6" fill="white" />
    </svg>
  );
}

function InstagramIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-b" cx="30%" cy="107%" r="140%">
          <stop offset="0%"   stopColor="#ffd676" />
          <stop offset="25%"  stopColor="#f4700a" />
          <stop offset="50%"  stopColor="#e1306c" />
          <stop offset="75%"  stopColor="#833ab4" />
          <stop offset="100%" stopColor="#5851db" />
        </radialGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ig-b)" />
      <rect x="12" y="12" width="24" height="24" rx="6.5" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="6" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="33.5" cy="14.5" r="1.6" fill="white" />
    </svg>
  );
}

/* ── Permissions the OAuth request covers ───────────── */
const PERMISSIONS = [
  {
    icon: User,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    title: "Profile & Account Info",
    detail: "Your username, profile picture, bio, follower count, and account type.",
  },
  {
    icon: BarChart3,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    title: "Analytics & Insights",
    detail: "Reach, impressions, engagement rate, and post-level performance data.",
  },
  {
    icon: Upload,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Content Publishing",
    detail: "Schedule and publish posts on your behalf — only when you explicitly approve.",
  },
];

/* ── Permission Consent Modal ───────────────────────── */
function ConsentModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="glass-strong rounded-3xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8) 40%, rgba(6,182,212,0.7) 70%, transparent)" }}
        />

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <InstagramIcon size={40} />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Connect Instagram
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">via Meta Business OAuth 2.0</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Intro */}
        <div className="px-6 pb-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Ghostal will request access to the following from your Instagram account. You can disconnect at any time from Settings.
          </p>
        </div>

        {/* Permission list */}
        <div className="px-6 space-y-2.5 pb-5">
          {PERMISSIONS.map(({ icon: Icon, color, bg, title, detail }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-snug">{title}</p>
                <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">{detail}</p>
              </div>
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div className="mx-6 mb-5 flex items-start gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15 px-3.5 py-2.5">
          <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
          <p className="text-xs text-emerald-400 leading-relaxed">
            <span className="font-semibold">We never store your password.</span> Access is granted via Meta's secure OAuth 2.0. You can revoke permissions from your Instagram settings at any time.
          </p>
        </div>

        {/* Checkbox consent */}
        <div className="mx-6 mb-4">
          <label className="flex items-start gap-3 cursor-pointer group" htmlFor="ig-consent-check">
            <div className="relative mt-0.5 shrink-0">
              <input
                id="ig-consent-check"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                  agreed
                    ? "border-violet-500 bg-violet-600"
                    : "border-white/20 bg-white/5 group-hover:border-white/40"
                }`}
              >
                {agreed && (
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
              I understand and agree that Ghostal will access the above information from my Instagram account to provide its services.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!agreed}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all ${
              agreed
                ? "hover:brightness-110 active:scale-[0.98] cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)" }}
          >
            Allow &amp; Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────── */
export default function IntegrationRequired({
  pageName,
  description = "Connect your Instagram account to unlock analytics, automate posting, and more.",
}: IntegrationRequiredProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerOAuth = () => {
    setError(null);
    setConnecting(true);
    setShowConsent(false);

    const instagramAppId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    if (!instagramAppId) {
      setError("Instagram App ID is not configured. Please contact support.");
      setConnecting(false);
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/instagram/callback`;
    const scope =
      "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights";

    const stateToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    sessionStorage.setItem("ig_oauth_state", stateToken);

    const oauthUrl = `https://www.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${stateToken}`;

    window.location.href = oauthUrl;
  };

  return (
    <>
      {/* Consent modal */}
      <AnimatePresence>
        {showConsent && (
          <ConsentModal
            onConfirm={triggerOAuth}
            onCancel={() => setShowConsent(false)}
          />
        )}
      </AnimatePresence>

      {/* Inline card */}
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="glass rounded-2xl p-5 w-full max-w-sm"
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <InstagramIcon size={52} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white leading-snug">
                Connect Instagram
              </h2>
              <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              Secure &amp; Read-Only Access
            </span>
            <button
              onClick={() => setShowConsent(true)}
              disabled={connecting}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <InstagramIconSmall />
              )}
              {connecting ? "Connecting…" : "Connect"}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
