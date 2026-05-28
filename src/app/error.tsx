"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error("Unhandled runtime error captured by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07070a] dot-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-[95px] pointer-events-none animate-glow-pulse" />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Error icon circle */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
        </div>

        {/* Heading */}
        <span className="inline-block rounded-full bg-red-500/10 border border-red-500/20 px-3.5 py-1 text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
          Runtime Exception
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
          An unexpected error occurred in the application layer. Antigravity system has successfully isolated the crash to protect your data.
        </p>

        {/* Error description for debug */}
        {error?.message && (
          <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Error Details</p>
            <p className="mt-1 text-xs font-mono text-red-300 break-all line-clamp-3 select-all">
              {error.message}
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:border-white/20 hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
