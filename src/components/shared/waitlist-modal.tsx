"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after animation
    setTimeout(() => {
      setStatus("idle");
      setEmail("");
      setName("");
      setErrorMsg("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d18] shadow-2xl shadow-violet-900/30">
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

              {/* Background glow */}
              <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-80 rounded-full bg-violet-600/20 blur-3xl" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    /* Success State */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-4"
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                      </div>
                      <h3 className="mb-2 text-2xl font-bold text-white">You&apos;re on the list! 🎉</h3>
                      <p className="text-sm text-white/50 max-w-xs">
                        We&apos;ve sent a confirmation to <span className="text-violet-400 font-medium">{email}</span>. 
                        We&apos;ll reach out as soon as Ghostal is ready for you.
                      </p>
                      <button
                        onClick={handleClose}
                        className="mt-6 rounded-xl bg-white/5 px-6 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    /* Form State */
                    <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Icon + Title */}
                      <div className="mb-6 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                          <Sparkles className="h-6 w-6 text-violet-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Join the Waitlist</h2>
                        <p className="mt-2 text-sm text-white/50">
                          Be first to access Ghostal when we open the doors.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                            Your name (optional)
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Alex"
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.07]"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-white/50 uppercase tracking-wider">
                            Email address <span className="text-violet-400">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              placeholder="you@example.com"
                              className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-violet-500/50 focus:bg-white/[0.07]"
                            />
                          </div>
                        </div>

                        {/* Error */}
                        {status === "error" && (
                          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {errorMsg}
                          </p>
                        )}

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={status === "loading"}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                          {status === "loading" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Joining...
                            </>
                          ) : (
                            "Reserve My Spot →"
                          )}
                        </button>

                        <p className="text-center text-xs text-white/25">
                          No spam. Unsubscribe anytime.
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
