import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/auth/instagram/initiate
 *
 * Starts the Instagram OAuth flow server-side so the state token cookie
 * is set in the HTTP response headers — not via document.cookie in the
 * browser. This guarantees the cookie is present when Instagram redirects
 * back to /api/auth/instagram/callback, even across the cross-origin
 * instagram.com → ghostal.xyz redirect chain.
 *
 * Cookie flags used:
 *   HttpOnly  — JS cannot tamper with it
 *   SameSite=None; Secure — explicitly allows the cookie to be sent on
 *                           cross-site top-level GET redirects (required
 *                           because the return trip is cross-origin)
 *   Path=/    — available to the callback route
 *   Max-Age=600 — expires in 10 minutes; single-use
 */
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  const clientId =
    process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ||
    process.env.NEXT_PUBLIC_META_APP_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Instagram App ID is not configured." },
      { status: 500 }
    );
  }

  // Generate a cryptographically-secure random state token
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const stateToken = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const redirectUri = `${origin}/api/auth/instagram/callback`;
  const scope =
    "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights";

  const oauthUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}` +
    `&response_type=code` +
    `&state=${stateToken}`;

  const response = NextResponse.redirect(oauthUrl);

  // Set state cookie server-side — this is the reliable way to ensure
  // the cookie survives the cross-origin redirect back from Instagram.
  response.cookies.set("ig_oauth_state", stateToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
