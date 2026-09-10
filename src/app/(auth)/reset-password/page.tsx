"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2, ArrowRight, CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSessionInvalid, setIsSessionInvalid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Your password reset session could not be verified. This link may have expired or is invalid. Please request a new password reset.");
          setIsSessionInvalid(true);
        }
      } catch (err: any) {
        console.error("Error verifying reset session:", err);
        setError("Failed to verify reset session. Please try again.");
        setIsSessionInvalid(true);
      } finally {
        setIsVerifying(false);
      }
    }
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active password reset session found. Your session may have expired.");
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Link may have expired.");
    } finally {
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
    <div className="glass-strong glow-violet rounded-2xl p-8">
      {isVerifying ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400 mb-4" />
          <p className="text-sm text-white/50">Verifying your reset session...</p>
        </div>
      ) : isSuccess ? (
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>

          <h2 className="mb-2 text-xl font-bold text-white">Password Updated</h2>
          <p className="mb-6 text-sm text-white/50">
            Your password has been changed successfully. You can now log in with your new credentials.
          </p>

          <Link
            href="/login"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white",
              "transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            )}
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Set new password</h1>
            <p className="mt-1 text-sm text-white/50">
              Please enter your new password below.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="reset-password"
                className="mb-1.5 block text-sm font-medium text-white/70"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/25",
                    "outline-none transition-all duration-200",
                    "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  )}
                  disabled={isLoading || isSessionInvalid}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-sm font-medium text-white/70"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25",
                    "outline-none transition-all duration-200",
                    "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  )}
                  disabled={isLoading || isSessionInvalid}
                />
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading || isSessionInvalid}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 py-2.5 text-sm font-semibold text-white",
                  "transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
