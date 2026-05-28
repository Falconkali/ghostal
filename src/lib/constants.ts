import type { PricingPlan, Testimonial } from "@/types";

export const APP_NAME = "GhostFlow";
export const APP_TAGLINE = "Maintain Content Consistency, Sustainably.";
export const APP_DESCRIPTION =
  "GhostFlow acts as a safety net for your Instagram queue — keeping your feed active even when you're offline.";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#comparison" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
] as const;

export const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Vault", href: "/vault", icon: "Archive" },
  { label: "Scheduler", href: "/scheduler", icon: "Calendar" },
  { label: "Ghost Mode", href: "/ghost-mode", icon: "Ghost" },
  { label: "AI Survival", href: "/ai-survival", icon: "Brain" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    slug: "starter",
    price: 9,
    period: "month",
    description: "Perfect for getting started with consistent posting.",
    features: [
      "Basic scheduling",
      "1 Instagram account",
      "50 vault items",
      "Basic queue management",
      "7-day analytics",
      "Email support",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
  {
    name: "Creator Pro",
    slug: "creator_pro",
    price: 29,
    period: "month",
    description: "For serious creators who never want to miss a beat.",
    features: [
      "Ghost Mode Autopilot",
      "AI caption refinement",
      "Unlimited vault",
      "Backup backlog queue",
      "3 Instagram accounts",
      "30-day analytics",
      "Queue empty alerts",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Survival AI",
    slug: "survival_ai",
    price: 79,
    period: "month",
    description: "Full autopilot. Your account never sleeps.",
    features: [
      "Full backlog autopilot",
      "Momentum analytics",
      "Evergreen recycler",
      "Advanced queue continuity",
      "10 Instagram accounts",
      "90-day analytics",
      "Custom AI training",
      "Emergency backup queue",
      "Dedicated account manager",
      "API access",
    ],
    highlighted: false,
    cta: "Start Free Trial",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    handle: "@priyacreates",
    avatarUrl: "",
    content:
      "I took a 3-week break during exams and came back to find GhostFlow had kept my account alive. My engagement actually GREW. This is insane.",
    role: "Content Creator · 120K Followers",
    rating: 5,
  },
  {
    id: "2",
    name: "Marcus Chen",
    handle: "@marcusvisuals",
    avatarUrl: "",
    content:
      "I used to spend hours every Sunday refilling my Buffer queue. GhostFlow's survival system means I never have to worry about my queue dying again.",
    role: "Visual Artist · 85K Followers",
    rating: 5,
  },
  {
    id: "3",
    name: "Sarah Williams",
    handle: "@sarahfitlife",
    avatarUrl: "",
    content:
      "Ghost Mode literally saved my account when I was in the hospital for 2 weeks. The AI remixed my old captions and nobody could tell I wasn't posting manually.",
    role: "Fitness Creator · 200K Followers",
    rating: 5,
  },
  {
    id: "4",
    name: "Alex Rivera",
    handle: "@alexdaily",
    avatarUrl: "",
    content:
      "The momentum dashboard alone is worth the subscription. I can see exactly when my consistency is slipping before it becomes a problem.",
    role: "Lifestyle Blogger · 50K Followers",
    rating: 5,
  },
  {
    id: "5",
    name: "Jordan Okafor",
    handle: "@jordanmotivates",
    avatarUrl: "",
    content:
      "Switched from Hootsuite to GhostFlow 6 months ago. The difference? My growth never stops, even when I do. The AI continuity system is next-level.",
    role: "Motivational Speaker · 300K Followers",
    rating: 5,
  },
  {
    id: "6",
    name: "Emma Zhang",
    handle: "@emmaeats",
    avatarUrl: "",
    content:
      "As a food blogger who travels constantly, GhostFlow is a lifesaver. It pulls from my vault and keeps my feed fresh even when I'm off the grid.",
    role: "Food Blogger · 150K Followers",
    rating: 5,
  },
];

export const COMING_SOON_PLATFORMS = [
  {
    name: "YouTube",
    icon: "Youtube",
    color: "from-red-500 to-red-700",
    description: "Automate your YouTube Shorts and video schedule.",
  },
  {
    name: "TikTok",
    icon: "Music",
    color: "from-pink-500 to-violet-600",
    description: "Keep your TikTok presence alive automatically.",
  },
  {
    name: "X / Twitter",
    icon: "Twitter",
    color: "from-blue-400 to-blue-600",
    description: "Never let your Twitter thread momentum die.",
  },
  {
    name: "Threads",
    icon: "AtSign",
    color: "from-gray-400 to-gray-600",
    description: "Stay consistent on Meta's text-based platform.",
  },
] as const;

export const FEATURES = [
  {
    id: "ghost-mode",
    title: "Ghost Mode (Queue Autopilot)",
    subtitle: "Your Schedule Fail-Safe",
    description:
      "An automated backup assistant. When Ghost Mode is active, it monitors your schedule and auto-populates calendar gaps using evergreen assets from your vault backlog.",
    icon: "Ghost",
    gradient: "from-violet-600 to-purple-800",
  },
  {
    id: "content-vault",
    title: "Content Vault",
    subtitle: "Your Creative Arsenal",
    description:
      "Upload reels, photos, carousels, and captions. AI organizes everything intelligently with auto-tagging for instant retrieval when autopilot backfill kicks in.",
    icon: "Archive",
    gradient: "from-cyan-500 to-blue-700",
  },
  {
    id: "inactivity-detection",
    title: "Queue Empty Alerts",
    subtitle: "Always Watching. Never Judging.",
    description:
      "Our system monitors your queue patterns and detects when you're running low on posts. It flags low queue risk and potential schedule gaps before it's too late.",
    icon: "Radar",
    gradient: "from-amber-500 to-orange-700",
  },
  {
    id: "ai-caption-remix",
    title: "AI Caption Refiner",
    subtitle: "Fresh Copy. Brand Voice.",
    description:
      "AI assists you in generating text variations of your archived captions to keep recycled content engaging while preserving your brand's unique tone.",
    icon: "Sparkles",
    gradient: "from-pink-500 to-rose-700",
  },
  {
    id: "survival-queue",
    title: "Continuity Backlog",
    subtitle: "The Schedule Fail-Safe",
    description:
      "When your primary publishing schedule runs dry, our backup queue fills scheduling gaps with evergreen assets from your vault backlog to preserve consistency.",
    icon: "Shield",
    gradient: "from-emerald-500 to-green-700",
  },
  {
    id: "momentum-dashboard",
    title: "Consistency Dashboard",
    subtitle: "Your Growth Vital Signs",
    description:
      "Track consistency score, queue depletion risks, calendar stability, and queue health. Know exactly where your content pipeline stands.",
    icon: "Activity",
    gradient: "from-indigo-500 to-violet-700",
  },
  {
    id: "ai-resurrection",
    title: "Evergreen Recycler",
    subtitle: "Reuse Top Content.",
    description:
      "Identify your highest-performing historical posts and schedule them to be reposted when your content pipeline hits a dry spell.",
    icon: "RotateCcw",
    gradient: "from-teal-500 to-cyan-700",
  },
] as const;
