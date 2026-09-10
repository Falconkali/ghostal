"use client";

import { useState } from "react";
import { Plus, Minus, Search, HelpCircle, ArrowRight, Inbox } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

const faqs = [
  {
    question: "Will Instagram shadowban me for using Ghostal?",
    answer: "No. Ghostal publishes content using the official Meta Graph API. We do not perform scraping, browser emulation, or reverse-engineered API calls. Your account remains 100% compliant with Instagram's Developer Terms.",
  },
  {
    question: "How does the AI remix my old captions?",
    answer: "Our NLP model parses your historical posts to analyze your tone, structure, hashtag density, and emoji usage. It then rewrites descriptions to convey similar sentiments using fresh wording so your feed remains organic.",
  },
  {
    question: "What happens when my primary queue runs out?",
    answer: "If your main queue empties, our empty-queue engine warns you. If no manual posts are added within your threshold window, the Backup Autopilot launches, serving evergreen vault posts and caption variations to maintain your consistency.",
  },
  {
    question: "Can I review content before it goes live in Ghost Mode?",
    answer: "Yes! You can configure notifications. Ghostal can ping you via email or push notification 12 hours before publishing a backup post, letting you edit, approve, or cancel it with a single tap.",
  },
  {
    question: "Which platforms do you support?",
    answer: "We currently support Instagram Professional (Creator & Business) accounts. Support for YouTube Shorts, TikTok, and X (Twitter) is currently in closed beta.",
  },
];

export default function HelpCenterPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] left-[-10%] h-[650px] w-[650px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            Help Center
          </span>
          <h1 id="help-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/50">
            Find answers to common questions about safety, automation, billing, and schedule consistency.
          </p>
        </section>

        {/* Search */}
        <section className="relative max-w-xl mx-auto mb-16">
          <input
            type="text"
            placeholder="Search help articles..."
            id="help-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/5 bg-[#12121a] px-5 py-4 pl-12 text-sm text-white placeholder-white/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <Search className="absolute left-4 top-4.5 h-5 w-5 text-white/40" />
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-4 mb-20">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#12121a]/50 p-12 text-center backdrop-blur-xl max-w-xl mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-zinc-500 mx-auto mb-4">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">No FAQ articles found</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;. Try broadening your keywords.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer select-none"
              >
                Reset Search Query
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/5 bg-[#12121a] overflow-hidden transition-all duration-300 hover:border-white/10"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    id={`faq-toggle-${idx}`}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-white hover:text-violet-400 transition-colors cursor-pointer select-none"
                  >
                    <span className="font-bold text-base md:text-lg">{faq.question}</span>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/60">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[300px] border-t border-white/5 px-6 py-5" : "max-h-0 overflow-hidden"
                    }`}
                  >
                    <p className="text-sm text-white/50 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Support CTA */}
        <section className="rounded-2xl border border-white/5 bg-gradient-to-r from-violet-600/5 to-cyan-500/5 p-8 text-center backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <HelpCircle className="mx-auto h-10 w-10 text-violet-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-lg mx-auto">
            Our support engineers are available to resolve custom API issues, billing questions, or layout issues.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 shadow-md shadow-violet-500/20"
          >
            Contact Support <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
