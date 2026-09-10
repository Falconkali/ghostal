"use client";

import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight, Zap, Crown } from "lucide-react";
import Link from "next/link";

interface UpgradeWallProps {
  feature: string;
  description: string;
  requiredPlan: "creator_pro" | "survival_ai";
  currentPlan: string;
}

const PLAN_LABELS: Record<string, { name: string; price: string; color: string; icon: React.ReactNode }> = {
  creator_pro: {
    name: "Creator Pro",
    price: "$29/mo",
    color: "from-violet-500 to-purple-600",
    icon: <Zap className="h-4 w-4" />,
  },
  survival_ai: {
    name: "Survival AI",
    price: "$79/mo",
    color: "from-amber-500 to-orange-600",
    icon: <Crown className="h-4 w-4" />,
  },
};

export default function UpgradeWall({ feature, description, requiredPlan, currentPlan }: UpgradeWallProps) {
  const plan = PLAN_LABELS[requiredPlan];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[60vh] px-4"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} blur-2xl opacity-30 rounded-full`} />
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
              <Lock className="h-12 w-12 text-zinc-400 mx-auto" />
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {feature} is locked
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {description}
          </p>
          <p className="text-zinc-500 text-xs">
            Your current plan: <span className="text-zinc-300 font-medium capitalize">{currentPlan.replace("_", " ")}</span>
          </p>
        </div>

        {/* Upgrade CTA */}
        <div className="space-y-3">
          <Link href="/#pricing">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${plan.color} text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow`}
            >
              {plan.icon}
              Upgrade to {plan.name} — {plan.price}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>

          <p className="text-zinc-600 text-xs flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </motion.div>
  );
}
