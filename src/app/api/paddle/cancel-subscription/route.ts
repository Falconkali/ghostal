import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getPaddleInstance } from "@/utils/paddle/get-paddle-instance";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const serverClient = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await serverClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user's profile and Paddle subscription ID
    const { data: profile, error: profileError } = await serverClient
      .from("profiles")
      .select("paddle_subscription_id, paddle_customer_id, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const subscriptionId = profile.paddle_subscription_id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No active Paddle subscription found for this account" },
        { status: 400 }
      );
    }

    // 3. Cancel the subscription via Paddle Node SDK
    // Default to 'next_billing_period' so creator keeps the access they already paid for
    const paddle = getPaddleInstance();
    const canceledSubscription = await paddle.subscriptions.cancel(
      subscriptionId,
      {
        effectiveFrom: "next_billing_period",
      }
    );

    const effectiveAt =
      canceledSubscription.scheduledChange?.effectiveAt ?? null;

    // 4. Update the profile status in Supabase
    await serverClient
      .from("profiles")
      .update({
        subscription_status: "canceling",
      })
      .eq("id", user.id);

    return NextResponse.json({
      success: true,
      message: effectiveAt
        ? `Subscription scheduled to cancel on ${new Date(effectiveAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
        : "Subscription will cancel at the end of your current billing period.",
      status: canceledSubscription.status,
      scheduledChange: effectiveAt,
    });
  } catch (err: any) {
    console.error("[paddle/cancel-subscription] Error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to cancel subscription with Paddle. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
