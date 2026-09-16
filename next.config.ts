import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Build a CSP string that removes unsafe-eval in production
const cspDirectives = [
  "default-src 'self'",
  // unsafe-eval only needed in dev for Next.js HMR & Framer Motion; removed in prod
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.paddle.com https://*.paddle.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.paddle.com",
  "img-src 'self' data: blob: https://*.supabase.co https://picsum.photos https://res.cloudinary.com https://*.cdninstagram.com https://*.fbcdn.net https://*.paddle.com",
  "font-src 'self' data: https://fonts.gstatic.com https://*.paddle.com",
  "connect-src 'self' https://*.supabase.co https://graph.instagram.com wss://*.supabase.co https://api.cloudinary.com https://*.paddle.com https://buy.paddle.com https://checkout.paddle.com",
  "frame-src 'self' https://*.paddle.com https://buy.paddle.com https://checkout.paddle.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.paddle.com https://buy.paddle.com",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },


  // Allow next/image to load from Supabase, Cloudinary, and picsum
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent*.cdninstagram.com",
      },
    ],
  },
};

export default nextConfig;
