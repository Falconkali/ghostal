import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ghostal — Automated Content Backup & Consistency Scheduler",
    template: "%s | Ghostal",
  },
  description:
    "Automated content backup and queue consistency system. Ghostal keeps your Instagram schedule active automatically using backup vaults when you're offline.",
  keywords: [
    "instagram scheduling",
    "creator tools",
    "social media scheduling",
    "content backup",
    "queue autopilot",
    "creator continuity",
    "instagram automation",
    "ghost mode",
  ],
  metadataBase: new URL("https://ghostal.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ghostal — Automated Content Backup & Consistency Scheduler",
    description:
      "Automated content backup and queue consistency system that keeps your Instagram schedule active using backup vaults.",
    type: "website",
    url: "https://ghostal.xyz",
    siteName: "Ghostal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ghostal — Instagram Creator Survival Mode",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghostal — Automated Content Backup & Consistency Scheduler",
    description:
      "Automated content backup and queue consistency system that keeps your Instagram schedule active using backup vaults.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <noscript>
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "#7c3aed",
            color: "white",
            padding: "12px 16px",
            textAlign: "center",
            fontSize: "14px",
            zIndex: 9999,
          }}>
            Ghostal requires JavaScript to run. Please enable JavaScript in your browser settings.
          </div>
        </noscript>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
