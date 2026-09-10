"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Inbox,
  BarChart2,
  Sparkles,
  Link2,
  Rocket,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const UPCOMING = [
  {
    icon: MessageSquare,
    title: "Comments Central",
    description:
      "Track every comment on your posts in real-time. Auto-reply with AI so you never miss engagement — replies go out even when you're offline.",
    progress: 68,
    status: "In Development",
    statusColor: "violet",
    eta: "Very Soon",
  },
  {
    icon: Inbox,
    title: "DM Inbox",
    description:
      "All your Instagram DMs in one clean dashboard. Reply, filter and never lose a lead buried in your messages again.",
    progress: 40,
    status: "In Progress",
    statusColor: "blue",
    eta: "Coming Soon",
  },
  {
    icon: BarChart2,
    title: "Advanced Analytics",
    description:
      "Deep-dive into which posts are hitting, when your audience is most active, and what content is worth repeating.",
    progress: 30,
    status: "In Progress",
    statusColor: "cyan",
    eta: "Coming Soon",
  },
  {
    icon: Sparkles,
    title: "AI Caption Studio",
    description:
      "Describe your post in one sentence. Ghostal writes 5 caption variations in your tone — with hashtags included.",
    progress: 20,
    status: "Planned",
    statusColor: "pink",
    eta: "Later",
  },
  {
    icon: Link2,
    title: "Link in Bio Manager",
    description:
      "Build and manage a micro landing page from Ghostal. Update your link in bio without touching Instagram.",
    progress: 0,
    status: "Planned",
    statusColor: "amber",
    eta: "Later",
  },
];

const STATUS_COLORS: Record<string, string> = {
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  pink: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const PROGRESS_COLORS: Record<string, string> = {
  violet: "from-violet-500 to-purple-500",
  blue: "from-blue-500 to-indigo-500",
  cyan: "from-cyan-500 to-blue-500",
  pink: "from-pink-500 to-rose-500",
  amber: "from-amber-500 to-orange-500",
};

export default function UpcomingPage() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-8">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            What&apos;s Coming
          </h1>
        </div>
        <p className="text-sm text-zinc-500 pl-12">
          Features we&apos;re actively building — track the progress here.
        </p>
      </motion.div>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-violet-600/8 blur-[120px] -z-10" />

      {/* Feature Cards */}
      <div className="grid grid-cols-1 gap-4">
        {UPCOMING.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="group relative rounded-2xl border border-white/[0.06] bg-[#0d0c18]/80 backdrop-blur-sm p-5 hover:border-white/10 transition-all duration-300"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  feature.progress === 0
                    ? "bg-white/5"
                    : `bg-gradient-to-br ${PROGRESS_COLORS[feature.statusColor]}/20`
                )}>
                  <feature.icon className={cn(
                    "h-5 w-5",
                    feature.progress === 0 ? "text-zinc-600" : `text-${feature.statusColor}-400`
                  )} />
                </div>

                {/* Title + desc */}
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-foreground">{feature.title}</h2>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Right: badges */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                  STATUS_COLORS[feature.statusColor]
                )}>
                  {feature.status}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                  <Clock className="h-3 w-3" />
                  {feature.eta}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            {feature.progress > 0 && (
              <div className="mt-4 pl-14">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-zinc-600">Progress</span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    `text-${feature.statusColor}-400`
                  )}>
                    {feature.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full max-w-sm rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", PROGRESS_COLORS[feature.statusColor])}
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.progress}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {feature.progress === 0 && (
              <div className="mt-4 pl-14">
                <span className="text-[10px] text-zinc-700 italic">Not started yet — on the roadmap</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-xs text-zinc-700 pb-4"
      >
        We ship fast. Check back often. 🚀
      </motion.p>
    </div>
  );
}
