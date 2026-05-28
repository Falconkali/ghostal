"use client";

import { Ghost, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07070a] dot-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/5 blur-[95px] pointer-events-none animate-glow-pulse" />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Ghost floating circle */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-float">
          <Ghost className="h-8 w-8" />
        </div>

        {/* Heading */}
        <span className="inline-block rounded-full bg-violet-500/10 border border-violet-500/20 px-3.5 py-1 text-xs font-semibold text-violet-400 uppercase tracking-wider mb-3">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Lost in the Algorithm
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
          The page you are looking for has been archived, scheduled, or deleted. Keep posting consistency high by returning to the controls.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:border-white/20 hover:bg-white/10 transition-all active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
