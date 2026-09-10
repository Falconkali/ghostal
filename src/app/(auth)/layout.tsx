"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-[#09090f] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <p className="text-sm text-zinc-400 font-medium">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090f] px-4 py-8">
      {/* ——— Animated gradient blobs ——— */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 animate-glow-pulse"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" as const }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-cyan-500/15 animate-glow-pulse"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, -40, 25, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" as const }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" as const }}
        />
      </div>

      {/* ——— Dot grid overlay ——— */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />

      {/* ——— Logo ——— */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" as const }}
        className="relative z-10 mb-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-white transition-opacity hover:opacity-80"
        >
          <Image src="/logo.png" alt="Ghostal" width={40} height={40} className="object-contain rounded-xl" />
          <span className="text-xl font-bold tracking-tight gradient-text">Ghostal</span>
        </Link>
      </motion.div>

      {/* ——— Content ——— */}
      <div className="relative z-10 w-full max-w-md">{children}</div>

      {/* ——— Footer text ——— */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative z-10 mt-8 text-center text-xs text-white/30"
      >
        © {new Date().getFullYear()} Ghostal. All rights reserved.
      </motion.p>
    </div>
  );
}
