import { NextRequest } from "next/server";
import { EventName } from "@paddle/paddle-node-sdk";
import { getPaddleInstance } from "@/utils/paddle/get-paddle-instance";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

function getPlanFromItems(items: any[]): string {
  const priceToPlan: Record<string, string> = {};

  const register = (priceId: string | undefined, plan: string) => {
    if (priceId && priceId.trim()) {
      priceToPlan[priceId.trim()] = plan;
    }
  };

  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER, "starter");
  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTH, "starter");
  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEAR, "starter");
  register(process.env.PADDLE_PRICE_STARTER, "starter");

  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_CREATOR_PRO, "creator_pro");
  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTH, "creator_pro");
  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEAR, "creator_pro");
  register(process.env.PADDLE_PRICE_CREATOR_PRO, "creator_pro");

  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_SURVIVAL_AI, "survival_ai");
  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_MONTH, "survival_ai");
  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_YEAR, "survival_ai");
  register(process.env.PADDLE_PRICE_SURVIVAL_AI, "survival_ai");

  register(process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME, "lifetime");
  register(process.env.PADDLE_PRICE_LIFETIME, "lifetime");

  for (const item of items) {
    const priceId = item?.price?.id ?? item?.priceId ?? "";
    if (priceId && priceToPlan[priceId]) return priceToPlan[priceId];
  }
  return "starter";
}

/**
 * Records a Paddle event ID in the paddle_webhook_events table for idempotency.
 * Returns true if the event was newly inserted (not a duplicate), false if it already existed.
 */
async function recordAndCheckIdempotency(eventId: string): Promise<boolean> {
  if (!eventId) return true; // no ID to check — proceed

  const { error } = await supabase
    .from("paddle_webhook_events")
    .insert({ event_id: eventId, processed_at: new Date().toISOString() });

  if (error) {
    // Unique constraint violation = duplicate event
    if (error.code === "23505") {
      console.log(`[paddle/webhook] Duplicate event ignored: ${eventId}`);
      return false;
    }
    // Table may not exist yet — log but allow processing to continue
    console.warn("[paddle/webhook] Idempotency insert error:", error.message);
  }

  return true;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature") ?? "";
  const rawBody = await request.text();
  const secret = process.env.PADDLE_WEBHOOK_SECRET ?? "";

  if (!signature || !rawBody) {
    return Response.json({ error: "Missing signature or body" }, { status: 400 });
  }

  try {
    const paddle = getPaddleInstance();
    const event = await paddle.webhooks.unmarshal(rawBody, secret, signature);

    if (!event) {
      return Response.json({ received: true });
    }

    // Idempotency: skip if this exact event was already processed
    const eventId = (event as any).eventId ?? (event as any).id ?? "";
    const isNew = await recordAndCheckIdempotency(eventId);
    if (!isNew) {
      return Response.json({ received: true, duplicate: true });
    }

    switch (event.eventType) {
      // ── Subscription created / updated ──────────────────────────────
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated: {
        const sub = event.data as any;
        const customData = sub.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) break;

        const plan = getPlanFromItems(sub.items ?? []);
        const status = sub.status;

        await supabase
          .from("profiles")
          .update({
            plan: status === "active" || status === "trialing" ? plan : "free",
            paddle_subscription_id: sub.id,
            paddle_customer_id: sub.customerId,
            payment_provider: "paddle",
          })
          .eq("id", userId);
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────
      case EventName.SubscriptionCanceled: {
        const sub = event.data as any;
        const customData = sub.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) break;

        await supabase
          .from("profiles")
          .update({ plan: "free", payment_provider: null, subscription_status: "canceled" })
          .eq("id", userId);
        break;
      }

      // ── One-time transaction completed (Lifetime) ────────────────────
      case EventName.TransactionCompleted: {
        const tx = event.data as any;
        const customData = tx.customData as Record<string, string> | null;
        const userId = customData?.userId;
        if (!userId) break;

        const plan = getPlanFromItems(tx.items ?? []);
        if (plan === "lifetime") {
          await supabase
            .from("profiles")
            .update({
              plan: "lifetime",
              paddle_customer_id: tx.customerId,
              payment_provider: "paddle",
            })
            .eq("id", userId);
        }
        break;
      }

      default:
        break;
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("[paddle/webhook] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
