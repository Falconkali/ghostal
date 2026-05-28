"use client";

import { useState, useEffect } from "react";
import { BookOpen, Key, Calendar, Shield, Cpu, Terminal, Sparkles, Code } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Getting Started",
    links: [
      { label: "Introduction", href: "#intro" },
      { label: "Quick Start Guide", href: "#quickstart" },
      { label: "Platform Connections", href: "#connect" },
    ],
  },
  {
    title: "Core Features",
    links: [
      { label: "Ghost Mode Config", href: "#ghostmode" },
      { label: "Content Vault Management", href: "#vault" },
      { label: "AI Survival Queue", href: "#survival" },
    ],
  },
  {
    title: "Advanced Guides",
    links: [
      { label: "Custom Caption Remixing", href: "#remix" },
      { label: "API Integrations", href: "#api" },
    ],
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    // Handle initial state if scrolled on load
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setActiveSection("");
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[15%] left-[20%] h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Mobile Documentation Menu */}
          <div className="w-full block lg:hidden mb-8 border border-white/5 bg-[#12121a] p-4 rounded-xl">
            <label htmlFor="docs-mobile-nav" className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
              Select Guide Section
            </label>
            <div className="relative">
              <select
                id="docs-mobile-nav"
                value={activeSection}
                onChange={(e) => {
                  const href = e.target.value;
                  setActiveSection(href);
                  const el = document.querySelector(href);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="w-full rounded-lg border border-white/10 bg-[#12121a] px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="" disabled>Navigate to section...</option>
                {navigation.map((section, idx) => (
                  <optgroup key={idx} label={section.title} className="bg-[#12121a]">
                    {section.links.map((link, lIdx) => (
                      <option key={lIdx} value={link.href}>
                        {link.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Sidebar Nav (Desktop only) */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-32 space-y-8 max-h-[calc(100vh-160px)] overflow-y-auto pr-4">
            {navigation.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, lIdx) => {
                    const isActive = activeSection === link.href;
                    return (
                      <li key={lIdx}>
                        <a
                          href={link.href}
                          className={cn(
                            "block text-sm transition-all duration-200 pl-3 border-l-2",
                            isActive
                              ? "text-violet-400 font-semibold border-violet-500 bg-violet-500/5 py-0.5 rounded-r"
                              : "text-white/60 hover:text-violet-400 border-transparent hover:border-white/10"
                          )}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </aside>

          {/* Main Docs Content */}
          <main className="flex-1 max-w-3xl">
            {/* Header */}
            <header className="mb-12 border-b border-white/5 pb-8">
              <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 mb-4">
                Docs
              </span>
              <h1 id="docs-title" className="text-4xl font-extrabold text-white tracking-tight mb-4">
                Introduction to {APP_NAME}
              </h1>
              <p className="text-lg text-white/50 leading-relaxed">
                Welcome to the official developer and creator documentation for {APP_NAME}. Learn how to set up autonomous algorithms preservation for your accounts.
              </p>
            </header>

            {/* Doc Sections */}
            <article className="space-y-16">
              {/* Introduction */}
              <section id="intro" className="scroll-mt-36">
                <h2 className="text-2xl font-bold text-white mb-4">What is {APP_NAME}?</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  {APP_NAME} is an automated creator continuity system. It monitors your social channels and steps in dynamically when you are inactive to schedule posts, remix your captions, and recycle evergreen content from your vault.
                </p>
                <p className="text-white/60 leading-relaxed">
                  Our system aims to maintain your engagement growth so you can take vacations or breaks without losing your hard-earned algorithmic momentum.
                </p>
              </section>

              {/* Quickstart */}
              <section id="quickstart" className="scroll-mt-36 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Start Guide</h2>
                <p className="text-white/60 leading-relaxed mb-6">
                  Follow these three simple steps to secure your creator continuity:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="rounded-xl border border-white/5 bg-[#12121a] p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 mb-4">
                      <Key className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-white mb-2">1. Connect account</h4>
                    <p className="text-xs text-white/50 leading-relaxed">Link your Facebook/Instagram Professional Account.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#12121a] p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 mb-4">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-white mb-2">2. Load the Vault</h4>
                    <p className="text-xs text-white/50 leading-relaxed">Upload at least 5-10 high-quality photos or reels.</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#12121a] p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-4">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-white mb-2">3. Enable Ghost</h4>
                    <p className="text-xs text-white/50 leading-relaxed">Turn on Ghost Mode in dashboard settings.</p>
                  </div>
                </div>
              </section>

              {/* Connections */}
              <section id="connect" className="scroll-mt-36 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Connecting Platforms</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  To publish on your behalf, {APP_NAME} requires official API permissions. We use standard OAuth 2.0 flows to request access token scopes:
                </p>
                <div className="rounded-xl border border-white/5 bg-[#12121a] p-4 font-mono text-xs text-white/70 space-y-2">
                  <p className="text-violet-400">// API scopes requested</p>
                  <p>instagram_basic</p>
                  <p>instagram_content_publish</p>
                  <p>pages_read_engagement</p>
                  <p>pages_show_list</p>
                </div>
              </section>

              {/* Ghost Mode */}
              <section id="ghostmode" className="scroll-mt-36 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Ghost Mode Configuration</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  Ghost Mode is guided by the **Inactivity Detection Engine**. You can adjust the detection threshold inside settings:
                </p>
                <ul className="list-disc pl-6 text-white/60 space-y-2 mb-6">
                  <li><strong>Aggressive:</strong> System triggers after 24 hours of no activity.</li>
                  <li><strong>Standard (Recommended):</strong> System triggers after 48 hours.</li>
                  <li><strong>Conservative:</strong> System triggers after 72 hours.</li>
                </ul>
              </section>

              {/* Vault */}
              <section id="vault" className="scroll-mt-36 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Content Vault Management</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  The Vault stores files that the AI can choose from. It is categorized by post relevance tags:
                </p>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-violet-400" />
                    Vault Status Query Example
                  </h4>
                  <pre className="text-xs text-white/70 font-mono overflow-x-auto bg-[#0a0a0f] p-4 rounded-lg">
{`curl -X GET "https://api.ghostflow.ai/v1/vault" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  </pre>
                </div>
              </section>

              {/* AI Survival Queue */}
              <section id="survival" className="scroll-mt-36 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white mb-4">AI Survival Queue</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  The AI Survival Queue serves as a fail-safe backup during prolonged creator absences. If your primary schedule runs dry and Ghost Mode is enabled, the AI engine will scan your evergreen media in the Content Vault and generate fresh, remixed captions to seed the scheduler calendar automatically.
                </p>
                <p className="text-white/60 leading-relaxed">
                  This ensures that even if you are offline for several weeks, your content feed remains fresh and the algorithm keeps receiving consistent publication signals.
                </p>
              </section>

              {/* Custom Caption Remixing */}
              <section id="remix" className="scroll-mt-36 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Custom Caption Remixing</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  Rather than outputting generic AI responses, the remixing module reads your actual historical caption context, hashtags, and writing style. It performs sentence-structure mutations and mixes in new relevant tags while maintaining the core tone and voice of the original asset.
                </p>
                <p className="text-white/60 leading-relaxed">
                  You can test and preview caption variations directly within the Content Vault by selecting any media item and clicking the "Edit" button to prompt alternate drafts.
                </p>
              </section>

              {/* API Integrations */}
              <section id="api" className="scroll-mt-36 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white mb-4">API Integrations</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  Developer integrations are fully supported for enterprise plans. You can invoke automated webhook endpoints on successful publications, check system queue health metrics, or push raw assets directly into your vault container using standard API tokens.
                </p>
                <div className="rounded-xl border border-white/5 bg-[#12121a] p-4 font-mono text-xs text-white/70 space-y-2">
                  <p className="text-violet-400">// API endpoint headers</p>
                  <p>X-GhostFlow-Client-ID: [your_client_id]</p>
                  <p>X-GhostFlow-Signature: [sha256_payload_signature]</p>
                </div>
              </section>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
