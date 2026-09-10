import { NextRequest } from "next/server";

/**
 * Validates the Origin header of a request to prevent CSRF attacks.
 * Only allows requests from the same origin as the app.
 * Safe to skip for GET requests (they are idempotent).
 */
export function validateCsrfOrigin(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  // Safe methods don't need CSRF protection
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || origin === "null") {
    // If Origin is missing (e.g. stripped by proxy), fallback to Referer
    const referer = request.headers.get("referer");
    if (!referer) {
      // Do not allow originless/refererless mutation requests from browsers
      // If server-to-server POST is needed, use a secret token, not CSRF exemption.
      return false;
    }
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) return true;
      if (process.env.NODE_ENV === "development" && refererHost.startsWith("localhost")) return true;
      return false;
    } catch {
      return false;
    }
  }

  try {
    const originHost = new URL(origin).host;
    // Allow same-host requests and localhost in dev
    if (originHost === host) return true;
    if (process.env.NODE_ENV === "development" && originHost.startsWith("localhost")) return true;
    return false;
  } catch {
    return false;
  }
}
