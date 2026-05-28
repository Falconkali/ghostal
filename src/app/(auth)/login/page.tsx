"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Ghost,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Chrome,
  Apple,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase() as any,
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-strong glow-violet rounded-2xl p-8"
    >
      {/* Ghost icon */}
      <motion.div variants={itemVariants} className="mb-6 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 ring-1 ring-white/10">
          <Ghost className="h-7 w-7 text-violet-400" />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50">
          Sign in to your GhostFlow account
        </p>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                "w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25",
                "outline-none transition-all duration-200",
                "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              )}
              disabled={isLoading}
            />
          </div>
        </motion.div>

        {/* Password field */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/25",
                "outline-none transition-all duration-200",
                "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Remember me + Forgot password */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <label className="flex cursor-pointer items-center gap-2">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "h-4 w-4 rounded border border-white/20 bg-white/5 transition-all",
                  "peer-checked:border-violet-500 peer-checked:bg-violet-500",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/30"
                )}
              >
                {rememberMe && (
                  <svg
                    className="h-4 w-4 text-white"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M12 5L6.5 10.5L4 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-white/50">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-violet-400 transition-colors hover:text-violet-300"
          >
            Forgot password?
          </Link>
        </motion.div>

        {/* Submit button */}
        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 text-sm font-semibold text-white",
              "transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25",
              "disabled:cursor-not-allowed disabled:opacity-60",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-[#12121a]"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div
        variants={itemVariants}
        className="my-6 flex items-center gap-3"
      >
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30">or continue with</span>
        <div className="h-px flex-1 bg-white/10" />
      </motion.div>

      {/* Social buttons */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Chrome, label: "Google" },
          { icon: Apple, label: "Apple" },
          { icon: Twitter, label: "Twitter" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleSocialLogin(label)}
            disabled={isLoading}
            className={cn(
              "glass flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm text-white/70",
              "transition-all duration-200 hover:bg-white/10 hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Bottom link */}
      <motion.p
        variants={itemVariants}
        className="mt-6 text-center text-sm text-white/40"
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-violet-400 transition-colors hover:text-violet-300"
        >
          Sign up
        </Link>
      </motion.p>
    </motion.div>
  );
}
