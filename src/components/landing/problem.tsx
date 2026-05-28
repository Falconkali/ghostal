"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Flame,
  Battery,
  TrendingDown,
  Skull,
  Calendar,
  EyeOff,
} from "lucide-react";

const painPoints = [
  {
    icon: Flame,
    title: "Burnout",
    description:
      "You push content until you crash. Then radio silence for weeks. Your audience forgets you exist.",
    gradient: "from-red-500 to-orange-600",
  },
  {
    icon: Battery,
    title: "Forgetting to Refill",
    description:
      "Your scheduling queue runs dry and you don't notice until your account has been silent for days.",
    gradient: "from-amber-500 to-yellow-600",
  },
  {
    icon: TrendingDown,
    title: "Inconsistency",
    description:
      "You post 5 times one week, zero the next. Irregular schedules can impact your reach and reduce audience engagement.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Skull,
    title: "Reach Penalties",
    description:
      "Extended periods of silence make social networks deprioritize your feed content. Your hard-won momentum drops.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Calendar,
    title: "Life Gets Busy",
    description:
      "Travel, family, health — life happens. Your content strategy shouldn't collapse when you take a break.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: EyeOff,
    title: "Disappearing Online",
    description:
      "One week of inactivity and your followers start wondering if you quit. Your brand dissolves in silence.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Problem() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
            The Problem
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="gradient-text">The Creator&apos;s Silent Killer</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            Every creator faces these threats. Most don&apos;t survive them.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {painPoints.map((point) => (
            <motion.div key={point.title} variants={cardVariants}>
              <div className="group relative h-full rounded-2xl border border-white/5 bg-[#12121a] p-6 transition-all duration-300 hover:border-white/10 hover:bg-[#16161f] hover:shadow-2xl hover:shadow-violet-500/5">
                {/* Icon */}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${point.gradient} shadow-lg`}
                >
                  <point.icon className="h-6 w-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {point.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-white/50">
                  {point.description}
                </p>

                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
