"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { Twitter, Instagram, Github, Linkedin, ArrowRight, Ghost } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const NAV = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Ghost Mode", href: "/#ghost-mode" },
    { label: "Roadmap", href: "/upcoming" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/api-docs" },
    { label: "Blog", href: "/blog" },
    { label: "Help Center", href: "/help" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Community: [
    { label: "Community Hub", href: "/community" },
    { label: "System Status", href: "/status" },
    { label: "Press & Media", href: "/press" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "GDPR Compliance", href: "/gdpr" },
  ],
};

const SOCIAL = [
  { icon: Twitter,   href: "https://twitter.com",   label: "X / Twitter" },
  { icon: Linkedin,  href: "https://linkedin.com",  label: "LinkedIn"    },
  { icon: Github,    href: "https://github.com",    label: "GitHub"      },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram"   },
];

const MARQUEE_ITEMS = [
  "AI Scheduling", "Instagram Automation", "Content Vault", "AI Captions",
  "Ghost Mode", "Analytics", "Auto Publishing", "Smart Queue", "Evergreen Content",
];

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
/* Aurora: only scale, NO rotate — rotating a blur(60px) element rerenders every frame */
@keyframes gf-aurora-drift {
  0%,100% { transform: translate(-50%,-50%) scale(1); }
  50%     { transform: translate(-50%,-50%) scale(1.12); }
}
@keyframes gf-marquee-run {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.333%); }
}
@keyframes gf-heartbeat {
  0%,80%,100% { transform: scale(1); }
  40%         { transform: scale(1.35); }
}

@media (prefers-reduced-motion: reduce) {
  .gf-aurora, .gf-marquee-track, .gf-heartbeat-el { animation: none !important; }
}

.gf-aurora {
  animation: gf-aurora-drift 22s ease-in-out infinite;
  will-change: transform;
}
.gf-marquee-track {
  /* 60s instead of 45s — fewer frames needed, same visual effect */
  animation: gf-marquee-run 60s linear infinite;
  will-change: transform;
}
/* heartbeat is transform-only — stays on compositor, acceptable cost */
.gf-heartbeat-el { animation: gf-heartbeat 1.9s ease-in-out infinite; }

.gf-monument {
  font-size: clamp(48px, 14.5vw, 210px);
  line-height: 0.85;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: transparent;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.22) 0%,
    rgba(255,255,255,0.04) 80%,
    transparent 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  /* will-change removed — GSAP sets/removes it transiently during scroll animation */
}

.gf-heading-glow {
  background: linear-gradient(175deg, #fff 0%, rgba(255,255,255,0.65) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gf-grid {
  background-size: 58px 58px;
  background-image:
    linear-gradient(to right, rgba(255,255,255,.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,.02) 1px, transparent 1px);
}

.gf-pill {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  /* only transition what actually changes on hover */
  transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
}

/* will-change removed — GSAP sets/removes it transiently during scroll reveal */
.gf-scroll-el { opacity: 0; }
`;

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div className="gf-marquee-track flex w-max py-2.5">
        {items.map((label, i) => (
          <React.Fragment key={i}>
            <span className="whitespace-nowrap px-5 text-[10px] font-bold uppercase tracking-[.3em] text-white/25">
              {label}
            </span>
            <span className="self-center text-violet-500/35 text-[9px]">✦</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  const footerRef     = useRef<HTMLElement>(null);
  const monumentRef   = useRef<HTMLDivElement>(null);
  const auroraRef     = useRef<HTMLDivElement>(null);
  const headingRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef   = useRef<HTMLParagraphElement>(null);
  const ctaRef        = useRef<HTMLDivElement>(null);
  const linksRef      = useRef<HTMLDivElement>(null);
  const bottomBarRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const footerEl = footerRef.current;
    if (!footerEl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(
        [monumentRef.current, auroraRef.current, headingRef.current,
         subtitleRef.current, ctaRef.current, linksRef.current, bottomBarRef.current],
        { opacity: 1, y: 0, scale: 1 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Content elements bidirectional scroll scrub
      const contentEls = [
        headingRef.current,
        subtitleRef.current,
        ctaRef.current,
        linksRef.current,
        bottomBarRef.current,
      ].filter(Boolean);

      gsap.fromTo(
        contentEls,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: footerEl,
            start: "top 95%",
            end: "top 75%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );

      // 2. Aurora bloom bidirectional scroll scrub
      if (auroraRef.current) {
        gsap.fromTo(
          auroraRef.current,
          { opacity: 0, scale: 0.75 },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: footerEl,
              start: "top 95%",
              end: "top 70%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // 3. GHOSTAL Monument — Bidirectional Scroll Scrub (Desktop & Mobile)
      if (monumentRef.current) {
        gsap.fromTo(
          monumentRef.current,
          { y: 70, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: monumentRef.current,
              start: "top 100%",
              end: "bottom 100%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }, footerEl);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <footer
        ref={footerRef}
        className="relative w-full overflow-hidden bg-[#07070d] text-white pt-6 pb-2"
        aria-label="Site footer"
      >
        {/* Dot grid background */}
        <div className="gf-grid pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Aurora glow blob */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            ref={auroraRef}
            className="gf-aurora gf-scroll-el absolute rounded-[50%]"
            style={{
              width: "75vw",
              height: "50vh",
              bottom: "5%",
              left: "50%",
              transform: "translate(-50%, 0)",
              background: `
                radial-gradient(
                  ellipse at 50% 50%,
                  rgba(109,40,217,.22) 0%,
                  rgba(6,182,212,.12) 50%,
                  transparent 75%
                )
              `,
              filter: "blur(60px)",
            }}
          />
        </div>

        {/* Top Marquee */}
        <div className="relative z-10 border-b border-white/[.04] bg-white/[.015]" aria-hidden="true">
          <Marquee />
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-10 pb-6 flex flex-col gap-10">
          
          {/* CTA Section */}
          <div className="flex flex-col items-center text-center pt-2 sm:pt-6">
            <h2
              ref={headingRef}
              className="gf-heading-glow gf-scroll-el mb-3 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight"
            >
              Never disappear from your audience.
            </h2>
            <p
              ref={subtitleRef}
              className="gf-scroll-el mb-6 max-w-lg text-xs sm:text-sm text-white/50 leading-relaxed"
            >
              Ghostal automatically schedules and publishes your Instagram content, keeping your audience engaged effortlessly.
            </p>
            <div
              ref={ctaRef}
              className="gf-scroll-el flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="/signup"
                aria-label="Start your free trial"
                className="gf-pill inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, rgba(109,40,217,.95) 0%, rgba(6,182,212,.85) 100%)",
                  border: "1px solid rgba(109,40,217,.5)",
                  boxShadow: "0 0 30px rgba(109,40,217,.3)",
                }}
              >
                <Ghost className="h-4 w-4" aria-hidden="true" />
                Start Free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="/contact"
                aria-label="Book a demo"
                className="gf-pill inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold text-white/60 hover:text-white"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.09)",
                }}
              >
                Book a Demo
              </a>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div
            ref={linksRef}
            className="gf-scroll-el w-full border-t border-white/[.06] pt-8"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
              {/* Brand Column */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                <Link href="/" className="mb-2.5 inline-flex items-center gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded-lg flex-shrink-0">
                    <Image
                      src="/logo.png"
                      alt={APP_NAME}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {APP_NAME}
                  </span>
                </Link>
                <p className="mb-3 max-w-[210px] text-[11px] leading-relaxed text-white/40">
                  AI-powered Instagram scheduling that keeps your feed alive.
                </p>
                <div className="flex items-center gap-2">
                  {SOCIAL.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[.08] bg-white/[.03] text-white/40 transition-colors hover:border-violet-500/40 hover:text-violet-400"
                    >
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Nav Columns */}
              {Object.entries(NAV).map(([section, links]) => (
                <div key={section}>
                  <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {section}
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        {href.startsWith("/#") ? (
                          <a
                            href={href}
                            className="text-[12px] text-white/50 hover:text-white font-medium transition-colors"
                          >
                            {label}
                          </a>
                        ) : (
                          <Link
                            href={href}
                            className="text-[12px] text-white/50 hover:text-white font-medium transition-colors"
                          >
                            {label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright Line */}
          <div
            ref={bottomBarRef}
            className="gf-scroll-el flex flex-col items-center justify-between gap-1 border-t border-white/[.05] pt-4 text-[11px] text-white/35 sm:flex-row"
          >
            <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Made for creators who never want to stop growing
              <span className="gf-heartbeat-el text-red-500/80" aria-hidden="true">❤</span>
            </p>
          </div>
        </div>

        {/* GHOSTAL Monument Banner — Anchored smoothly at the bottom */}
        <div className="relative z-10 w-full overflow-hidden text-center pt-2 pb-2">
          <div
            ref={monumentRef}
            className="gf-monument gf-scroll-el inline-block mx-auto"
            aria-hidden="true"
          >
            GHOSTAL
          </div>
        </div>
      </footer>
    </>
  );
}
