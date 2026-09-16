import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * GET - Meta Webhook Verification Handler
 * 
 * When you configure your webhook in the Meta Developer Dashboard, Meta sends a GET request
 * to your callback URL with verification parameters. Your server must verify the token
 * and return the 'hub.challenge' code to complete the handshake.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error("META_VERIFY_TOKEN is not configured in environment variables.");
    return new Response("Internal Server Error (Missing Configuration)", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Meta Webhook verification successful.");
    return new Response(challenge, { status: 200 });
  }

  console.warn("Meta Webhook verification failed. Token mismatch or invalid mode.");
  return new Response("Forbidden", { status: 403 });
}

/**
 * POST - Webhook Event Receiver
 * 
 * Meta delivers real-time events (DMs, comments, mentions) via POST requests containing JSON.
 * We must respond with 200 OK within 20 seconds to prevent Meta from retrying or disabling the webhook.
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-hub-signature-256");
    const rawBody = await request.text();

    // 1. Verify Request Signature — try both app secrets since the user may have
    //    two separate Meta/Instagram apps registered in their developer dashboard.
    const metaAppSecret = process.env.META_APP_SECRET;
    const igAppSecret = process.env.INSTAGRAM_APP_SECRET;

    if (!metaAppSecret && !igAppSecret) {
      console.error("No app secret configured (META_APP_SECRET or INSTAGRAM_APP_SECRET).");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!signature) {
      console.warn("Rejecting webhook request: missing x-hub-signature-256 header.");
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const isValid =
      (metaAppSecret && verifySignature(rawBody, signature, metaAppSecret)) ||
      (igAppSecret && verifySignature(rawBody, signature, igAppSecret));

    if (!isValid) {
      console.warn("Rejecting webhook request: invalid signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Parse Payload
    const payload = JSON.parse(rawBody);

    // 3. Process Events
    // Instagram webhooks may arrive as object=="instagram" (direct API)
    // OR object=="page" (when connected via a Facebook Page).
    if (payload.object === "instagram" || payload.object === "page") {
      const entries = payload.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const { field, value } = change;
          switch (field) {
            case "comments":
              await handleCommentEvent(value, entry.id);
              break;
            case "mentions":
              await handleMentionEvent(value, entry.id);
              break;
            case "messages":
              await handleDMEvent(value, entry.id);
              break;
            default:
              console.log(`Meta Webhook received unhandled field event: ${field}`);
          }
        }
      }
    }

    // 4. Respond quickly to meet Meta's 20-second timeout window
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Error processing Meta webhook payload:", err);
    // Return 200 OK to prevent Meta from retrying and causing duplication loops
    return NextResponse.json({ received: false }, { status: 200 });
  }
}

/**
 * Cryptographically verifies that the request payload matches the signature sent by Meta
 * using the SHA-256 algorithm and the configured App Secret.
 */
function verifySignature(payload: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    return false;
  }
  const signatureHex = parts[1];

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload, "utf8");
  const calculatedSignature = hmac.digest("hex");

  // Prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHex, "hex"),
      Buffer.from(calculatedSignature, "hex")
    );
  } catch (err) {
    return false;
  }
}

// ── Supabase Admin Client (uses service role key for server-side writes) ──
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn(
      "Webhook DB writes skipped: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured."
    );
    return null;
  }
  return createClient(url, serviceKey);
}

/**
 * Handle incoming comments on your Instagram media.
 * Writes a webhook_events record and auto-replies if the user has enabled it.
 *
 * Key invariants:
 *  - idempotency_key = commentId prevents duplicate rows on Meta retries
 *  - user_id is resolved from instagram_id so the RLS SELECT policy works
 *  - engagement_events also gets user_id for analytics RLS
 */
async function handleCommentEvent(value: any, entryId?: string) {

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const mediaId: string = value?.media?.id ?? value?.media_id ?? null;
    const commentId: string = value?.id ?? null;
    const commentText: string = value?.text ?? "";
    const commenterId: string = value?.from?.id ?? null;
    // The Instagram user ID who owns the media (the Ghostal user's IG account)
    // Fall back to entryId if media.owner is not provided (which is standard for the new API)
    const mediaOwnerId: string = value?.media?.owner?.id ?? entryId ?? null;

    // Resolve the Supabase user_id from the Instagram owner ID so rows are
    // visible to the logged-in user via RLS SELECT policies.
    let resolvedUserId: string | null = null;
    if (mediaOwnerId) {
      const { data: ownerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("instagram_id", mediaOwnerId)
        .limit(1)
        .maybeSingle();
      resolvedUserId = ownerProfile?.id ?? null;
    }

    // Fallback: If we couldn't resolve the user by Instagram ID, try matching
    // the media ID against scheduled posts published by our platform users.
    if (!resolvedUserId && mediaId) {
      const { data: postData } = await supabase
        .from("scheduled_posts")
        .select("user_id")
        .eq("instagram_media_id", mediaId)
        .limit(1)
        .maybeSingle();
      resolvedUserId = postData?.user_id ?? null;
    }

    // 1. Store the raw event (upsert on idempotency_key = commentId so Meta
    //    retries are silently ignored rather than creating duplicate rows).
    if (commentId) {
      await supabase.from("webhook_events").upsert(
        {
          event_type: "comment",
          instagram_media_id: mediaId,
          instagram_object_id: commentId,
          idempotency_key: commentId,
          payload: value,
          processed_at: new Date().toISOString(),
          user_id: resolvedUserId,
        },
        { onConflict: "idempotency_key", ignoreDuplicates: true }
      );
    } else {
      // No comment ID — insert without dedup guard
      await supabase.from("webhook_events").insert({
        event_type: "comment",
        instagram_media_id: mediaId,
        instagram_object_id: null,
        payload: value,
        processed_at: new Date().toISOString(),
        user_id: resolvedUserId,
      });
    }

    // 2. If the media ID is associated with a scheduled post, increment comment count.
    //    Guard with try/catch — this RPC may not exist in all environments.
    if (mediaId) {
      try {
        await supabase.rpc("increment_post_comment_count", {
          p_instagram_media_id: mediaId,
        });
      } catch (rpcErr: any) {
        console.warn("[webhook] increment_post_comment_count RPC skipped:", rpcErr.message);
      }
    }

    // 3. Log engagement metric for analytics (include user_id for RLS)
    if (mediaId && commentText) {
      await supabase.from("engagement_events").insert({
        event_type: "comment",
        instagram_media_id: mediaId,
        content_preview: commentText.substring(0, 120),
        actor_id: commenterId,
        occurred_at: new Date().toISOString(),
        user_id: resolvedUserId,
      });
    }

    // 4. Auto-reply if the user has enabled it.
    //    Don't reply to our own comments (avoid infinite loops).
    if (commentId && mediaOwnerId && commenterId !== mediaOwnerId) {
      await maybeAutoReply(supabase, mediaOwnerId, commentId);
    }

    console.log(
      `Comment event stored: mediaId=${mediaId}, commentId=${commentId}, userId=${resolvedUserId}`
    );
  } catch (err: any) {
    console.error("Error persisting comment event:", err.message);
  }
}

/**
 * Checks if the media owner has auto-reply enabled, then picks a random
 * reply variation and posts it to Instagram.
 */
async function maybeAutoReply(supabase: any, instagramId: string, commentId: string) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("instagram_token, auto_reply_enabled, auto_reply_variations")
      .eq("instagram_id", instagramId)
      .limit(1)
      .maybeSingle();

    if (!profile?.auto_reply_enabled || !profile?.instagram_token) return;

    const variations: string[] = profile.auto_reply_variations ?? [
      "Thanks so much! 🙏",
      "Appreciate you! ❤️",
      "Thank you! 🙌",
      "Means a lot! ✨",
      "Thanks for the love! 💜",
    ];

    if (variations.length === 0) return;

    // Pick a random variation
    const message = variations[Math.floor(Math.random() * variations.length)];

    // Decrypt the token — import crypto module inline since this is a server module
    const { decrypt } = await import("@/lib/crypto");
    const accessToken = decrypt(profile.instagram_token);

    const replyRes = await fetch(
      `https://graph.instagram.com/v21.0/${commentId}/replies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ message, access_token: accessToken }),
      }
    );

    const replyData = await replyRes.json();
    if (replyData.error) {
      console.error("[auto-reply] Instagram API error:", replyData.error.message);
    } else {
      console.log(`[auto-reply] Replied to comment ${commentId}: "${message}"`);
    }
  } catch (err: any) {
    console.error("[auto-reply] Error posting auto-reply:", err.message);
  }
}

/**
 * Handle mentions of your profile in comment text or captions.
 * Records the mention so creators can track brand reach and engagement trends.
 */
async function handleMentionEvent(value: any, entryId?: string) {

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const mediaId: string = value?.media_id ?? null;
    const commentId: string = value?.comment_id ?? null;

    // Resolve user_id from the instagram_id (entryId = the IG account that was mentioned)
    let userId: string | null = null;
    if (entryId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("instagram_id", entryId)
        .maybeSingle();
      userId = profile?.id ?? null;
    }

    const idempotencyKey = commentId || `mention-${mediaId}-${Date.now()}`;

    // Store the raw event (with user_id so RLS SELECT works) — upsert prevents duplicates on Meta retries
    await supabase.from("webhook_events").upsert(
      {
        user_id: userId,
        event_type: "mention",
        instagram_media_id: mediaId,
        instagram_object_id: commentId,
        idempotency_key: idempotencyKey,
        payload: value,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "idempotency_key", ignoreDuplicates: true }
    );

    // Log as an engagement event
    await supabase.from("engagement_events").insert({
      user_id: userId,
      event_type: "mention",
      instagram_media_id: mediaId,
      occurred_at: new Date().toISOString(),
    });

    console.log(`Mention event stored: mediaId=${mediaId}, commentId=${commentId}, userId=${userId}`);
  } catch (err: any) {
    console.error("Error persisting mention event:", err.message);
  }
}

/**
 * Handle Direct Messages (DMs) sent to your Instagram account.
 * Stores the message so future AI chatbot integrations can replay the queue.
 */
async function handleDMEvent(value: any, entryId?: string) {

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    const senderId: string = value?.sender?.id ?? null;
    const messageText: string = value?.message?.text ?? null;
    const messageId: string = value?.message?.mid ?? null;

    // Resolve user_id — entryId is the IG account that received the DM
    let userId: string | null = null;
    if (entryId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("instagram_id", entryId)
        .maybeSingle();
      userId = profile?.id ?? null;
    }

    const idempotencyKey = messageId || `dm-${senderId}-${Date.now()}`;

    // Store the raw event for auditability — upsert prevents duplicates on Meta retries
    await supabase.from("webhook_events").upsert(
      {
        user_id: userId,
        event_type: "dm",
        instagram_object_id: messageId,
        idempotency_key: idempotencyKey,
        payload: value,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "idempotency_key", ignoreDuplicates: true }
    );

    // Store in a dedicated DM inbox table (for future AI chatbot processing)
    if (senderId && messageText) {
      await supabase.from("dm_inbox").insert({
        user_id: userId,
        sender_id: senderId,
        message_id: messageId,
        message_text: messageText,
        received_at: new Date().toISOString(),
        processed: false,
      });
    }

    console.log(`DM event stored: senderId=${senderId}, messageId=${messageId}, userId=${userId}`);
  } catch (err: any) {
    console.error("Error persisting DM event:", err.message);
  }
}
