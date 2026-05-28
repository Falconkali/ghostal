"use client";

import { useState } from "react";
import { Search, Calendar, User, Clock, ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";

const categories = ["All Articles", "Content Strategies", "Creator Health", "AI & Automation", "Product Updates"];

interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    title: "The Instagram Content Strategy: Why Inconsistency Kills Reach",
    excerpt: "Ever wonder why taking a one-week break cuts your reach? We dissect the impact of publishing frequency on audience engagement.",
    category: "Content Strategies",
    author: "Alex Sterling",
    date: "May 24, 2026",
    readTime: "6 min read",
    slug: "instagram-consistency-reach",
    featured: true,
  },
  {
    title: "Mental Health in the Creator Economy: Finding Peace Outside the Post Button",
    excerpt: "The constant pressure to perform is leading to record levels of burnout. Here is a practical framework to separate your self-worth from your daily view counts.",
    category: "Creator Health",
    author: "Marcus Vane",
    date: "May 18, 2026",
    readTime: "8 min read",
    slug: "creator-burnout-prevention",
    featured: false,
  },
  {
    title: "Leveraging AI Captions Safely: How to Maintain Your Authentic Voice",
    excerpt: "AI copywriting can easily feel robotic. Learn the exact prompt engineering strategies we use to refine your old copy while preserving your brand voice.",
    category: "AI & Automation",
    author: "Dr. Livia Chen",
    date: "May 12, 2026",
    readTime: "5 min read",
    slug: "ai-captions-authentic-voice",
    featured: false,
  },
  {
    title: "Evergreen Content 101: Building an Unlimited Content Vault",
    excerpt: "Stop thinking of posts as disposable. Discover how to identify, catalog, and store evergreen content that can be reused infinitely to drive consistent growth.",
    category: "Content Strategies",
    author: "Alex Sterling",
    date: "May 05, 2026",
    readTime: "7 min read",
    slug: "evergreen-content-vault-strategy",
    featured: false,
  },
];

export default function BlogClient() {
  const [activeCategory, setActiveCategory] = useState("All Articles");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts based on active category and search query
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All Articles" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Extract featured and regular posts from the filtered set
  const featuredPost = filteredPosts.find((p) => p.featured);

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] right-[5%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="text-center mb-16">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            Resources
          </span>
          <h1 id="blog-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            The <span className="gradient-text">Creator Continuity</span> Blog
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Insights, guides, and tactical advice on maintaining calendar consistency while preserving your creative energy.
          </p>
        </section>

        {/* Filter Bar & Search */}
        <section className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-8 mb-12">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={idx}
                  id={`cat-btn-${idx}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search articles..."
              id="blog-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#12121a] px-4 py-3 pl-10 text-sm text-white placeholder-white/40 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-white/40" />
          </div>
        </section>

        {filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-white/5 bg-[#12121a]/50 p-12 text-center backdrop-blur-xl max-w-xl mx-auto my-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-zinc-500 mx-auto mb-4">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">No articles found</h3>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              We couldn&apos;t find any articles matching &quot;{searchQuery}&quot; under &quot;{activeCategory}&quot;. Try broadening your keywords or exploring another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All Articles");
              }}
              className="mt-6 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors cursor-pointer"
            >
              Reset Search & Category
            </button>
          </div>
        ) : (
          <>
            {/* Featured Post (only shown if there's an active matching featured article) */}
            {featuredPost && (
              <section className="mb-16">
                <article className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#12121a] p-6 md:p-10 transition-all hover:border-violet-500/20">
                  <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-3xl group-hover:bg-violet-600/10 transition-opacity" />
                  <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="w-full md:w-1/2 aspect-video rounded-xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-white/5 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_70%)] animate-glow-pulse" />
                      <span className="text-5xl">⚡</span>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/10">
                          {featuredPost.category}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-4 mb-3 group-hover:text-violet-300 transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed mb-6">
                          {featuredPost.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center gap-3 text-xs text-white/40">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featuredPost.author}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {featuredPost.date}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featuredPost.readTime}</span>
                        </div>
                        <Link
                          href={`/blog/${featuredPost.slug}`}
                          className="flex items-center gap-1 text-sm font-semibold text-violet-400 hover:text-violet-300"
                        >
                          Read Article <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* Regular Posts Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts
                .filter((p) => (featuredPost ? p.slug !== featuredPost.slug : true))
                .map((post, idx) => (
                  <article key={idx} className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-[#12121a] p-6 hover:border-violet-500/20 transition-all">
                    <div>
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-violet-600/10 to-cyan-500/10 border border-white/5 flex items-center justify-center mb-6 relative overflow-hidden">
                        <span className="text-3xl">📝</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/10">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/40"><Clock className="h-3 w-3" /> {post.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-white/50 leading-relaxed mb-6">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs text-white/40">{post.date}</span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
                      >
                        Read Article <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
