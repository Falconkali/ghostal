"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Ghost,
  Archive,
  Radar,
  Sparkles,
  Shield,
  Activity,
  RotateCcw,
} from "lucide-react";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Ghost,
  Archive,
  Radar,
  Sparkles,
  Shield,
  Activity,
  RotateCcw,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Features() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      id="features"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8"
    >
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[100px]" />
        <div className="absolute -left-40 bottom-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="gradient-text">Built For Creator Survival</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            Every feature is designed to protect your online presence — even when
            you can&apos;t.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature, i) => {
            const IconComponent = iconMap[feature.icon];
            const isLarge = i === 0 || i === 3;

            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                className={isLarge ? "md:col-span-2 lg:col-span-2" : ""}
              >
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#12121a] p-6 sm:p-8 transition-all duration-500 hover:border-white/10 hover:shadow-2xl hover:shadow-violet-500/5">
                  {/* Gradient highlight on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/0 via-transparent to-cyan-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]" />

                  {/* Top Row: Icon + Meta */}
                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-shadow group-hover:shadow-xl`}
                    >
                      {IconComponent && (
                        <IconComponent className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm font-medium text-white/40">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="relative z-10 mt-4 text-sm leading-relaxed text-white/50 sm:text-base sm:leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Corner glow on hover */}
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20`}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
