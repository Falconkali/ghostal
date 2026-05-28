"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Chrome,
  Apple,
  Twitter,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score: 2, label: "Medium", color: "bg-yellow-500" };
  return { score: 3, label: "Strong", color: "bg-emerald-500" };
}

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
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
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    try {
      await signup(fullName, email, password);
      // Wait for session sync or push directly
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: string) => {
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
      setError(err.message || `Failed to sign up with ${provider}`);
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
        staggerChildren: 0.07,
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
      {/* Heading */}
      <motion.div variants={itemVariants} className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-white/50">
          Start your creator survival journey
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="fullName"
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className={cn(
                "w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25",
                "outline-none transition-all duration-200",
                "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              )}
              disabled={isLoading}
            />
          </div>
        </motion.div>

        {/* Email */}
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

        {/* Password */}
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
              placeholder="Min. 6 characters"
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

          {/* Password strength indicator */}
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        level <= strength.score
                          ? strength.color
                          : "bg-white/10"
                      )}
                    />
                  ))}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    strength.score === 1 && "text-red-400",
                    strength.score === 2 && "text-yellow-400",
                    strength.score === 3 && "text-emerald-400"
                  )}
                >
                  {strength.label}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Confirm password */}
        <motion.div variants={itemVariants}>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-white/70"
          >
            Confirm Password
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className={cn(
                "w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/25",
                "outline-none transition-all duration-200",
                "focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20",
                confirmPassword.length > 0 &&
                  password !== confirmPassword &&
                  "border-red-500/40 focus:ring-red-500/20"
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-400">
              Passwords do not match
            </p>
          )}
        </motion.div>

        {/* Terms checkbox */}
        <motion.div variants={itemVariants}>
          <label className="flex cursor-pointer items-start gap-2">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "h-4 w-4 rounded border border-white/20 bg-white/5 transition-all",
                  "peer-checked:border-violet-500 peer-checked:bg-violet-500",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-violet-500/30"
                )}
              >
                {agreeTerms && (
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
            <span className="text-sm text-white/50">
              I agree to the{" "}
              <span className="text-violet-400 hover:text-violet-300 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-violet-400 hover:text-violet-300 cursor-pointer">
                Privacy Policy
              </span>
            </span>
          </label>
        </motion.div>

        {/* Submit */}
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
                Creating account…
              </span>
            ) : (
              "Create Account"
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
        <span className="text-xs text-white/30">or sign up with</span>
        <div className="h-px flex-1 bg-white/10" />
      </motion.div>

      {/* Social buttons */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { icon: Chrome, label: "Google" },
          { icon: Apple, label: "Apple" },
          { icon: Twitter, label: "Twitter" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleSocialSignup(label)}
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
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-violet-400 transition-colors hover:text-violet-300"
        >
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
