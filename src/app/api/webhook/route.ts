import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

    // 1. Verify Request Signature (Security Best Practice)
    const appSecret = process.env.META_APP_SECRET;
    if (appSecret) {
      if (!signature) {
        console.warn("Rejecting webhook request: missing x-hub-signature-256 header.");
        return NextResponse.json({ error: "Missing signature" }, { status: 401 });
      }

      const isValid = verifySignature(rawBody, signature, appSecret);
      if (!isValid) {
        console.warn("Rejecting webhook request: invalid signature signature.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("Warning: META_APP_SECRET is not configured. Skipping signature verification.");
    }

    // 2. Parse Payload
    const payload = JSON.parse(rawBody);
    console.log("Received Meta Webhook Payload:", JSON.stringify(payload, null, 2));

    // 3. Process Events (Route to dedicated handlers)
    // NOTE: Keep processing lightweight, or trigger an async worker, so we return a 200 OK fast.
    if (payload.object === "instagram") {
      const entries = payload.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const { field, value } = change;

          switch (field) {
            case "comments":
              await handleCommentEvent(value);
              break;
            case "mentions":
              await handleMentionEvent(value);
              break;
            case "messages":
              await handleDMEvent(value);
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

/**
 * Handle incoming comments on your Instagram media
 */
async function handleCommentEvent(value: any) {
  console.log("Processing Comment Event:", JSON.stringify(value, null, 2));
  // FUTURE: Connect to AI logic to remix captions or trigger safety notifications
}

/**
 * Handle mentions of your profile in comment text or captions
 */
async function handleMentionEvent(value: any) {
  console.log("Processing Mention Event:", JSON.stringify(value, null, 2));
  // FUTURE: Log engagement trends or trigger auto-replies
}

/**
 * Handle Direct Messages (DMs) sent to your Instagram account
 */
async function handleDMEvent(value: any) {
  console.log("Processing DM Event:", JSON.stringify(value, null, 2));
  // FUTURE: Wire up AI chatbot messaging logic here
}
