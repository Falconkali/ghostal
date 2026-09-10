import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ghostal.xyz";
  const now = new Date();

  return [
    // Core
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    // Auth
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/forgot-password`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    // Legal (required for Meta App Review)
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/data-deletion`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/cookie-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/gdpr`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    // Marketing
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/help`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/docs`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/status`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
  ];
}

