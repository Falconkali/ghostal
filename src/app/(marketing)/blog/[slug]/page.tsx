import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

/* ─────────────────────────────────────────────
   Blog post data — single source of truth.
   In production you'd fetch this from a CMS or DB.
───────────────────────────────────────────── */
interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
  featured: boolean;
  content: string;
}

const blogPosts: BlogPost[] = [
  {
    title: "The Instagram Content Strategy: Why Inconsistency Kills Reach",
    excerpt:
      "Ever wonder why taking a one-week break cuts your reach? We dissect the impact of publishing frequency on audience engagement.",
    category: "Content Strategies",
    author: "Alex Sterling",
    date: "May 24, 2026",
    readTime: "6 min read",
    slug: "instagram-consistency-reach",
    featured: true,
    content: `
The Instagram algorithm is less about quality and more about **predictability**. 

When you post consistently, the algorithm builds a model of your account and learns when to expect content from you. It pre-loads your posts into a segment of your followers' feeds before you even publish. This internal "slot reservation" is why consistent creators get a predictable baseline of early impressions the moment they publish.

## What Happens When You Stop

Taking a one-week break resets this model. The algorithm de-prioritises your account slot and redistributes that feed real estate to creators who have remained consistent. When you return, you're effectively starting the race from a cold start — which is why your first few posts after a break always underperform, even if the content itself is excellent.

## The Three-Day Rule

Data from creator analytics platforms consistently shows that accounts which allow more than **3 consecutive days** between posts see a statistically significant drop in reach on the next publish. The reach deficit compounds: after 7 days of inactivity, the median reach recovery takes 12–18 days of re-consistent posting to restore.

## Ghost Mode: A Technical Solution

Tools like GhostFlow's Ghost Mode exist precisely to protect your reach score during unavoidable gaps. By pre-loading a survival queue of evergreen content that auto-publishes on your behalf, the algorithm never detects an inactivity gap — meaning your reach stays intact even during vacations, burnout recovery, or creative blocks.

## Practical Takeaways

1. **Post at minimum every 3 days**, even if the content is simpler than your usual standard.
2. **Build a vault of 15–20 evergreen posts** that can be recycled without context loss (inspirational quotes, tutorials, product demos).
3. **Use scheduling tools** to batch-create 2 weeks of content in a single session.
4. **Don't delete low-performing posts** — they still count as activity signals to the algorithm.

Consistency isn't a creative constraint. It's the technical foundation on which all your creative work performs.
    `.trim(),
  },
  {
    title: "Mental Health in the Creator Economy: Finding Peace Outside the Post Button",
    excerpt:
      "The constant pressure to perform is leading to record levels of burnout. Here is a practical framework to separate your self-worth from your daily view counts.",
    category: "Creator Health",
    author: "Marcus Vane",
    date: "May 18, 2026",
    readTime: "8 min read",
    slug: "creator-burnout-prevention",
    featured: false,
    content: `
The creator economy was built on passion — but it's increasingly sustained by anxiety.

A 2025 study of 2,400 full-time content creators found that **71% reported symptoms of burnout**, and **43% had considered quitting social media entirely** within the past 12 months. The same study found that the number-one trigger wasn't a lack of income — it was the relentless psychological pressure of the **perpetual content machine**.

## The Engagement Trap

Social media platforms are engineered to make you feel that every hour without a post is an hour of lost momentum. Notification bubbles, "your reach dropped" alerts, and algorithmic push notifications create a Pavlovian anxiety loop that's extremely difficult to escape — even on your days off.

This isn't an accident. Platforms benefit from anxious, highly active creators.

## Separating Identity from Metrics

The healthiest long-term creators share one trait: they treat metrics as business data, not self-assessment scores. A low-view video doesn't mean you're failing — it means that specific piece of content didn't connect with the algorithm on that day. These are separate things.

**Practical reframe**: Write a list of 5 things you created this month that you're proud of, regardless of their performance numbers. Revisit this list on bad days.

## Structural Solutions

1. **Schedule a "content sabbath"** — one full day per week where you don't post, check analytics, or engage with notifications.
2. **Set a notification curfew** — disable all platform notifications between 9pm and 8am.
3. **Pre-schedule two weeks in advance** — the psychological relief of knowing your queue is full is significant and measurable.
4. **Use automation for survival** — tools like Ghost Mode mean you never have to sacrifice a creative break for reach preservation.

## The Non-Negotiables

Burnout isn't a content strategy problem. It's a nervous system problem. Sleep, movement, real-world social connection, and professional support are not optional extras — they are the infrastructure on which your creative output depends.

If you've been running on empty for more than two weeks, the ROI of taking a proper rest almost always exceeds the cost of the algorithmic dip.
    `.trim(),
  },
  {
    title: "Leveraging AI Captions Safely: How to Maintain Your Authentic Voice",
    excerpt:
      "AI copywriting can easily feel robotic. Learn the exact prompt engineering strategies we use to refine your old copy while preserving your brand voice.",
    category: "AI & Automation",
    author: "Dr. Livia Chen",
    date: "May 12, 2026",
    readTime: "5 min read",
    slug: "ai-captions-authentic-voice",
    featured: false,
    content: `
The biggest complaint about AI-generated captions is that they sound like AI-generated captions.

This is a **prompt engineering problem**, not a model problem. With the right input structure, modern language models are capable of producing output that closely mirrors individual brand voice — but most creators use them incorrectly.

## The Voice Audit First

Before writing a single prompt, you need to audit your existing content for voice markers:

- **Sentence length pattern** — Do you write in short punches or long flowing sentences?
- **Vocabulary level** — Do you use industry jargon or plain language?
- **Emotional register** — Are you motivational, educational, or conversational?
- **Signature phrases** — Do you have recurring openers or sign-offs?

Collect 10–15 of your best-performing captions. These become your **voice training corpus**.

## The Remix Prompt Structure

The most effective AI caption remix prompt follows this structure:

\`\`\`
You are rewriting Instagram captions for [CREATOR NAME].

Brand voice characteristics:
- [2-3 sentences describing tone]
- [Typical sentence length]
- [Words/phrases they always/never use]

Original caption to remix:
[PASTE ORIGINAL CAPTION]

Instructions:
- Preserve the core message and hooks
- Update any time-specific references
- Match the voice characteristics above exactly
- Do not use phrases like "dive in" or "game-changer"
- Output only the caption text, no explanation
\`\`\`

## What GhostFlow's AI Does Differently

GhostFlow's caption remix engine feeds your historical vault captions as context alongside the remix prompt. This means the AI isn't working from a generic voice profile — it's pattern-matching against your actual body of work. The result is meaningfully more authentic than any off-the-shelf GPT prompt.

## Red Flags to Watch For

- Excessive exclamation marks (a telltale AI signal)
- Vague motivational language ("unlock your potential")
- Perfectly parallel sentence structure (humans are messier)
- Loss of your signature sign-off or hook style

Always read AI output aloud before posting. If it doesn't sound like something you'd say in a voice note to a friend in your niche, it needs another pass.
    `.trim(),
  },
  {
    title: "Evergreen Content 101: Building an Unlimited Content Vault",
    excerpt:
      "Stop thinking of posts as disposable. Discover how to identify, catalog, and store evergreen content that can be reused infinitely to drive consistent growth.",
    category: "Content Strategies",
    author: "Alex Sterling",
    date: "May 05, 2026",
    readTime: "7 min read",
    slug: "evergreen-content-vault-strategy",
    featured: false,
    content: `
Most creators treat content like a newspaper — published once, then discarded.

This is one of the most expensive mistakes in the creator economy, because the vast majority of Instagram users **have never seen your older posts**. The average creator gains thousands of new followers every year who have zero visibility into their historical content library.

## What Makes Content "Evergreen"

Evergreen content retains relevance regardless of the date it's published. It doesn't reference current events, trending sounds, or time-specific context. Examples:

- **Educational how-to posts** ("How to set up your posting schedule")
- **Inspirational frameworks** ("The 3 things I wish I knew when I started")
- **Product or service demonstrations** that don't reference time
- **Behind-the-scenes content** that focuses on process, not timeline

Non-evergreen content includes trend reactions, topical commentary, seasonal promotions, and anything that mentions "this week" or "right now."

## The Vault System

A content vault is a structured library of evergreen assets tagged by:

1. **Content type** (Reel, Carousel, Single Image, Story)
2. **Theme** (Educational, Inspirational, Social Proof, Entertainment)
3. **Niche tag** (Fitness, Finance, Photography, etc.)
4. **Performance tier** (Top 20%, Mid, Experimental)
5. **Last published date** (to prevent over-recycling)

GhostFlow's Vault feature does all of this automatically — every asset you upload is tagged, scored, and queued for intelligent recycling based on its performance history and time since last use.

## The Recycling Rule

A well-structured evergreen post can be recycled safely every **90–120 days** on Instagram without meaningful audience fatigue. With a vault of 30+ evergreen assets, you have a content buffer of 9–12 months of zero-effort posts available at all times.

This doesn't mean you stop creating new content — it means your new content strategy sits on top of an always-on baseline that protects your reach score even during creative dry spells.

## Building Your First Vault

**Week 1**: Audit your existing posts. Tag everything older than 60 days that doesn't have a time reference. This is your seed vault.

**Week 2**: Identify your top 10 performing posts of all time. These are your "anchor" evergreen assets — they've already proven their value and can be recycled with highest confidence.

**Week 3**: Create 5 new posts specifically designed as evergreen content (no time references, no trend hooks).

**Ongoing**: Every time you create a new piece of content, ask yourself: "Could this be re-posted in 6 months without editing?" If yes, tag it as evergreen immediately.

The vault isn't just a backup system — it's a strategic content asset that compounds in value over time.
    `.trim(),
  },
];

function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

function getRelatedPosts(current: BlogPost): BlogPost[] {
  return blogPosts
    .filter((p) => p.slug !== current.slug && p.category === current.category)
    .slice(0, 2);
}

/* ─────────────────────────────────────────────
   Dynamic metadata for SEO
───────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: `${post.title} — GhostFlow Blog`,
    description: post.excerpt,
  };
}

/* ─────────────────────────────────────────────
   Pre-render all known slugs at build time
───────────────────────────────────────────── */
export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

/* ─────────────────────────────────────────────
   Page component
───────────────────────────────────────────── */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post);

  // Convert simple markdown-ish content to HTML paragraphs
  const renderContent = (raw: string) => {
    return raw.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="text-xl font-bold text-white mt-10 mb-4 first:mt-0"
          >
            {block.replace("## ", "")}
          </h2>
        );
      }
      if (block.startsWith("```")) {
        const code = block.replace(/```[\w]*/g, "").trim();
        return (
          <pre
            key={i}
            className="rounded-xl bg-[#0c0c14] border border-white/10 p-5 text-xs text-violet-200 font-mono overflow-x-auto my-6 leading-relaxed"
          >
            <code>{code}</code>
          </pre>
        );
      }
      if (block.startsWith("- ") || block.includes("\n- ")) {
        const items = block
          .split("\n")
          .filter((l) => l.startsWith("- "))
          .map((l) => l.replace("- ", ""));
        return (
          <ul key={i} className="list-disc list-inside text-white/70 space-y-2 my-4 text-sm leading-relaxed">
            {items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            ))}
          </ul>
        );
      }
      if (block.match(/^\d+\./)) {
        const items = block.split("\n").filter((l) => l.match(/^\d+\./));
        return (
          <ol key={i} className="list-decimal list-inside text-white/70 space-y-2 my-4 text-sm leading-relaxed">
            {items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\.\s*/, '').replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            ))}
          </ol>
        );
      }
      return (
        <p
          key={i}
          className="text-white/70 leading-relaxed text-sm my-4"
          dangerouslySetInnerHTML={{
            __html: block.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>'),
          }}
        />
      );
    });
  };

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] right-[5%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-5 leading-tight">
            {post.title}
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/40 border-t border-b border-white/5 py-4">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.readTime}
            </span>
          </div>
        </header>

        {/* Hero graphic */}
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-white/5 flex items-center justify-center mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_70%)]" />
          <span className="text-6xl select-none">{post.featured ? "⚡" : "📝"}</span>
        </div>

        {/* Article body */}
        <article className="prose-sm">
          {renderContent(post.content)}
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-white/5 pt-10">
            <h2 className="text-lg font-bold text-white mb-6">More in {post.category}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="group rounded-2xl border border-white/5 bg-[#12121a] p-5 hover:border-violet-500/20 transition-all block"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                    {rp.category}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2 mb-2 group-hover:text-violet-300 transition-colors leading-snug">
                    {rp.title}
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{rp.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 mt-4 group-hover:text-violet-300 transition-colors">
                    Read Article <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Never miss a post again
          </h2>
          <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
            GhostFlow keeps your Instagram presence alive even when life gets in the way. Start your free trial today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all shadow-lg shadow-violet-500/20"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
