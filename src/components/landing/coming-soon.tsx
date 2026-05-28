"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Youtube, Music, Twitter, AtSign } from "lucide-react";
import { COMING_SOON_PLATFORMS } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Youtube,
  Music,
  Twitter,
  AtSign,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function ComingSoon() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Roadmap
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            <span className="gradient-text">Expanding to More Platforms</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/50 sm:text-lg">
            GhostFlow is coming to every platform where creators need protection.
          </p>
        </motion.div>

        {/* Platform Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {COMING_SOON_PLATFORMS.map((platform) => {
            const IconComponent = iconMap[platform.icon];

            return (
              <motion.div key={platform.name} variants={cardVariants}>
                <div className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-white/5 bg-[#12121a] p-6 text-center transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-violet-500/5">
                  {/* Coming Soon Badge */}
                  <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/50">
                    Coming Soon
                  </div>

                  {/* Icon */}
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${platform.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    {IconComponent && (
                      <IconComponent className="h-7 w-7 text-white" />
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {platform.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-white/40">
                    {platform.description}
                  </p>

                  {/* Hover glow */}
                  <div
                    className={`pointer-events-none absolute -bottom-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-gradient-to-br ${platform.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
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
