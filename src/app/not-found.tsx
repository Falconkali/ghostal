import Link from "next/link";
import { Ghost } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090f] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background blob */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6 max-w-md">
        {/* Ghost icon */}
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 ring-1 ring-white/10">
            <Ghost className="h-12 w-12 text-violet-400" />
          </div>
        </div>

        {/* Error code */}
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
          404 — Not Found
        </p>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          This page has gone{" "}
          <span className="gradient-text">ghost</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base text-white/50">
          The page you're looking for doesn't exist, was moved, or is haunted by our Ghost Mode AI.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-white/20">
        © {new Date().getFullYear()} Ghostal
      </p>
    </div>
  );
}
