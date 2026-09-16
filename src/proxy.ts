import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16+ Proxy (formerly Middleware)
 *
 * This file MUST be named `proxy.ts` at the `src/` level and export a function
 * named `proxy` for Next.js 16+ to automatically invoke it on every request.
 *
 * It refreshes the Supabase auth session cookie and enforces server-side
 * route protection redirects (unauthenticated users → /login, authenticated
 * users away from auth pages → /dashboard).
 *
 * See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, and logo assets (SVG, PNG, JPG, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
