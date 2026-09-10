export interface Tier {
  name: 'Starter' | 'Pro' | 'Advanced';
  description: string;
  features: string[];
  priceId: { month: string; year: string };
  featured?: boolean;
}

export const PricingTier: Tier[] = [
  {
    name: 'Starter',
    description: 'Perfect for solo creators getting started with autopilot consistency.',
    features: [
      '1 Instagram Account Sync',
      'Content Vault (Up to 50 assets)',
      'Ghost Mode Autopilot',
      '24/7 Queue Depletion Radar',
      'Meta Graph API v19.0 Compliance',
    ],
    priceId: {
      month: (process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTH || process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER || 'pri_01kxrhwa25zr395khz5h1zd8xb').trim(),
      year: (process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEAR || 'pri_01kyg04zct0hpqz77fzpjxsgh2').trim(),
    },
    featured: false,
  },
  {
    name: 'Pro',
    description: 'For growing creators who need full queue automation & AI caption remixing.',
    features: [
      '3 Instagram Accounts Sync',
      'Unlimited Content Vault',
      'AI Caption Tone Remix Engine',
      'Evergreen Post Resurrection',
      'Advanced 30-Day Analytics & Insights',
      'Priority Queue Execution',
    ],
    priceId: {
      month: (process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTH || process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR_PRO || 'pri_01kxrhwaksvvx3v5bw0wjhytf6').trim(),
      year: (process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEAR || 'pri_01kyg04ztq2cvjrwcqgk5r0mhb').trim(),
    },
    featured: true,
  },
  {
    name: 'Advanced',
    description: 'Complete hands-off AI autopilot for agencies & high-volume creators.',
    features: [
      'Unlimited Instagram Accounts',
      'AI Survival Autopilot Mode',
      'Multi-Format Engine (Reels, Carousels, Stories)',
      'Real-Time Inactivity Alert System',
      'Dedicated Founder Support & Onboarding',
      '100% Shadowban Protection Guarantee',
    ],
    priceId: {
      month: (process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_MONTH || process.env.NEXT_PUBLIC_PADDLE_PRICE_SURVIVAL_AI || 'pri_01kxrhwb58h9xsae7szgvanvhv').trim(),
      year: (process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_YEAR || 'pri_01kyg0507aeh2v7g0bh1pkhfd6').trim(),
    },
    featured: false,
  },
];
