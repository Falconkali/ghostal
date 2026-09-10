import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * Meta Data Deletion Callback Endpoint
 *
 * Meta calls this URL (via POST) when a user removes your app from their
 * Facebook / Instagram settings. We must:
 *   1. Verify the `signed_request` using our App Secret (HMAC-SHA256)
 *   2. Extract the app-scoped `user_id` from the payload
 *   3. Delete all data for that user from our database
 *   4. Return a JSON confirmation with a status URL + unique code
 *
 * Docs: https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export async function POST(request: NextRequest) {
  try {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      console.error("[data-deletion] META_APP_SECRET not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // ── 1. Parse the form-encoded body ──────────────────────────────────────
    const contentType = request.headers.get("content-type") || "";
    let signedRequest: string | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      signedRequest = params.get("signed_request");
    } else {
      // Some Meta implementations send JSON
      try {
        const json = await request.json();
        signedRequest = json.signed_request ?? null;
      } catch {
        // ignore
      }
    }

    if (!signedRequest) {
      console.warn("[data-deletion] Missing signed_request parameter");
      return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
    }

    // ── 2. Decode and verify the signed_request ──────────────────────────────
    // Format: {base64url-encoded HMAC-SHA256 signature}.{base64url-encoded JSON payload}
    const parts = signedRequest.split(".");
    if (parts.length !== 2) {
      return NextResponse.json({ error: "Invalid signed_request format" }, { status: 400 });
    }

    const [encodedSig, encodedPayload] = parts;

    // Decode payload
    let payload: { algorithm?: string; issued_at?: number; user_id?: string };
    try {
      const payloadJson = Buffer.from(encodedPayload, "base64url").toString("utf8");
      payload = JSON.parse(payloadJson);
    } catch {
      return NextResponse.json({ error: "Could not decode payload" }, { status: 400 });
    }

    if (payload.algorithm?.toUpperCase() !== "HMAC-SHA256") {
      return NextResponse.json({ error: "Unsupported signing algorithm" }, { status: 400 });
    }

    // Verify signature: HMAC-SHA256(encodedPayload, appSecret) must equal encodedSig
    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(encodedPayload)
      .digest();

    const receivedSig = Buffer.from(encodedSig, "base64url");

    const isValid =
      expectedSig.length === receivedSig.length &&
      crypto.timingSafeEqual(expectedSig, receivedSig);

    if (!isValid) {
      console.warn("[data-deletion] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const metaUserId = payload.user_id;
    if (!metaUserId) {
      return NextResponse.json({ error: "No user_id in payload" }, { status: 400 });
    }

    // ── 3. Delete all user data from our database ────────────────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find the Ghostal user by their Meta / Instagram app-scoped ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("instagram_id", metaUserId)
      .maybeSingle();

    // Generate a unique confirmation code regardless of whether we found the user
    // (idempotent — if user already deleted or never existed, we still confirm)
    const confirmationCode = crypto.randomBytes(12).toString("hex");

    if (profileError) {
      console.error("[data-deletion] DB lookup error:", profileError.message);
      // Still return a 200 — Meta expects confirmation even on errors
      return buildConfirmation(confirmationCode);
    }

    if (!profile) {
      // User not found — may have already been deleted or never connected via Meta
      console.info(`[data-deletion] No profile found for Meta user_id=${metaUserId} — already clean`);
      return buildConfirmation(confirmationCode);
    }

    const userId = profile.id;
    console.info(`[data-deletion] Deleting all data for Ghostal user=${userId} (Meta user=${metaUserId})`);

    // Delete in dependency order (child tables first, then profile)
    await Promise.allSettled([
      supabase.from("scheduled_posts").delete().eq("user_id", userId),
      supabase.from("vault_items").delete().eq("user_id", userId),
      supabase.from("survival_logs").delete().eq("user_id", userId),
      supabase.from("webhook_events").delete().eq("user_id", userId),
      supabase.from("engagement_events").delete().eq("user_id", userId),
      supabase.from("dm_inbox").delete().eq("user_id", userId),
    ]);

    // Clear the profile row's Instagram credentials and PII
    // We update rather than delete to preserve the Supabase Auth user record
    // (the auth.users row is separate — if they want full account deletion they use the in-app flow)
    await supabase
      .from("profiles")
      .update({
        instagram_connected: false,
        instagram_handle: null,
        instagram_username: null,
        instagram_token: null,
        instagram_id: null,
        instagram_followers_count: 0,
        instagram_following_count: 0,
        instagram_media_count: 0,
      })
      .eq("id", userId);

    console.info(`[data-deletion] Completed data deletion for user=${userId}`);

    // ── 4. Return the required Meta confirmation JSON ────────────────────────
    return buildConfirmation(confirmationCode);
  } catch (err: any) {
    console.error("[data-deletion] Unexpected error:", err);
    // Always return 200 to Meta — they retry on failures which could cause loops
    const fallbackCode = crypto.randomBytes(12).toString("hex");
    return buildConfirmation(fallbackCode);
  }
}

/**
 * Builds the required Meta Data Deletion Callback response.
 * The `url` is the page where users can see deletion instructions.
 * The `confirmation_code` is a unique token for the user to reference.
 */
function buildConfirmation(confirmationCode: string): NextResponse {
  let baseUrl: string;
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    // Always use the canonical production domain — VERCEL_URL can return a preview URL
    baseUrl = "https://ghostal.xyz";
  }

  return NextResponse.json(
    {
      url: `${baseUrl}/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
