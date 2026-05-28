import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GhostFlow — Automated Content Backup & Consistency Scheduler",
  description:
    "Automated content backup and queue consistency system. GhostFlow keeps your Instagram schedule active automatically using backup vaults when you're offline.",
  keywords: [
    "instagram scheduling",
    "creator tools",
    "social media scheduling",
    "AI content",
    "queue autopilot",
    "creator continuity",
  ],
  openGraph: {
    title: "GhostFlow — Automated Content Backup & Consistency Scheduler",
    description:
      "Automated content backup and queue consistency system that keeps your Instagram schedule active using backup vaults.",
    type: "website",
  },
};

import { AuthProvider } from "@/hooks/use-auth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
