import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Plan definitions — single source of truth for Stripe price IDs.
 * Set STRIPE_PRICE_CREATOR_PRO and STRIPE_PRICE_SURVIVAL_AI in .env.local
 * to your actual Stripe Price IDs (e.g. price_1Pxxxxxx).
 */
const PLANS: Record<string, { name: string; priceId: string | undefined }> = {
  creator_pro: {
    name: "Creator Pro",
    priceId: process.env.STRIPE_PRICE_CREATOR_PRO,
  },
  survival_ai: {
    name: "Survival AI",
    priceId: process.env.STRIPE_PRICE_SURVIVAL_AI,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !PLANS[plan]) {
      return NextResponse.json(
        { error: "Invalid plan specified. Valid options: creator_pro, survival_ai" },
        { status: 400 }
      );
    }

    // ── 1. Authenticate the user ──────────────────────────────────────────
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Check Stripe is configured ────────────────────────────────────
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // Stripe not configured — return a clear, actionable error
      return NextResponse.json(
        {
          error: "Payment processing is not configured yet.",
          details:
            "Add STRIPE_SECRET_KEY, STRIPE_PRICE_CREATOR_PRO, and STRIPE_PRICE_SURVIVAL_AI to your .env.local file to enable billing.",
        },
        { status: 503 }
      );
    }

    const planConfig = PLANS[plan];
    if (!planConfig.priceId) {
      return NextResponse.json(
        {
          error: `Stripe Price ID for "${planConfig.name}" is not configured.`,
          details: `Set STRIPE_PRICE_${plan.toUpperCase()} in your environment variables.`,
        },
        { status: 503 }
      );
    }

    // ── 3. Create Stripe Checkout Session ─────────────────────────────────
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-05-27.dahlia" });

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${origin}/settings?tab=billing&checkout=success`,
      cancel_url: `${origin}/settings?tab=billing&checkout=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Checkout session creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
