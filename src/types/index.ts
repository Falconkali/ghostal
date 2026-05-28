// ============================================
// GhostFlow TypeScript Types
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: "starter" | "creator_pro" | "survival_ai";
  instagramConnected: boolean;
  instagramHandle?: string;
  createdAt: string;
}

export interface InstagramAccount {
  id: string;
  handle: string;
  avatarUrl: string;
  followers: number;
  following: number;
  postsCount: number;
  isConnected: boolean;
  lastSyncAt: string;
}

export interface VaultItem {
  id: string;
  type: "reel" | "image" | "carousel" | "caption";
  title: string;
  caption: string;
  tags: VaultTag[];
  mediaUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  usedCount: number;
  performanceScore: number;
  isEvergreen: boolean;
}

export type VaultTag =
  | "motivational"
  | "meme"
  | "educational"
  | "evergreen"
  | "viral"
  | "trending"
  | "personal"
  | "promotional"
  | "bts"
  | "creative"
  | "lifestyle"
  | "productivity";

export interface ScheduledPost {
  id: string;
  vaultItemId: string;
  caption: string;
  hashtags: string[];
  firstComment?: string;
  scheduledAt: string;
  status: "scheduled" | "posted" | "failed" | "ghost_posted";
  type: "reel" | "image" | "carousel";
  thumbnailUrl?: string;
}

export interface GhostModeConfig {
  enabled: boolean;
  inactivityThresholdDays: number;
  emergencySurvivalMode: boolean;
  aiFallbackBehavior: "repost_evergreen" | "remix_captions" | "full_ai";
  maxSurvivalPostsPerWeek: number;
  preserveHashtags: boolean;
  notifyOnActivation: boolean;
}

export interface MomentumMetrics {
  consistencyScore: number; // 0-100
  inactivityRisk: "low" | "medium" | "high" | "critical";
  momentumStability: number; // 0-100
  queueHealth: number; // 0-100
  queueLifespanDays: number;
  postsThisWeek: number;
  postsLastWeek: number;
  survivalActivations: number;
  streakDays: number;
}

export interface AnalyticsData {
  date: string;
  posts: number;
  engagement: number;
  reach: number;
  momentum: number;
}

export interface AISuggestion {
  id: string;
  type: "repost" | "remix" | "resurrect" | "new_content";
  title: string;
  description: string;
  confidence: number;
  vaultItemId?: string;
  suggestedCaption?: string;
  createdAt: string;
}

export interface SurvivalLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "warning";
  postId?: string;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "danger";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PricingPlan {
  name: string;
  slug: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface Testimonial {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  content: string;
  role: string;
  rating: number;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}
