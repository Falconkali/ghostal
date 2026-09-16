import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/media
 *
 * Authenticated server-side proxy for external media URLs.
 * Restricts proxying to an allowlist of safe domains to prevent SSRF.
 * Only Instagram CDN and Cloudinary are permitted.
 */

// Allowed hostname suffixes for proxied media
const ALLOWED_HOSTS = [
  ".cdninstagram.com",
  ".fbcdn.net",
  "res.cloudinary.com",
  ".supabase.co",
];

function isAllowedHost(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") return false;
    return ALLOWED_HOSTS.some(
      (allowed) => hostname === allowed.replace(/^\./, "") || hostname.endsWith(allowed)
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // 1. Authentication — only logged-in users may proxy media
  const serverClient = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await serverClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate URL parameter
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // 3. SSRF protection — only allow known safe external domains
  if (!isAllowedHost(url)) {
    return new NextResponse("Forbidden: URL not in allowlist", { status: 403 });
  }

  // 4. Proxy the request
  try {
    const res = await fetch(url);

    if (!res.ok) {
      return new NextResponse("Failed to fetch upstream media", {
        status: res.status,
      });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      res.headers.get("content-type") || "application/octet-stream"
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(blob, { status: 200, headers });
  } catch (error) {
    console.error("[media proxy] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
