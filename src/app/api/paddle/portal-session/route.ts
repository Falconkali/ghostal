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

    // 2. Fetch the user's profile and Paddle customer ID
    const { data: profile, error: profileError } = await serverClient
      .from("profiles")
      .select("paddle_customer_id, paddle_subscription_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    let customerId = profile.paddle_customer_id;
    const subscriptionIds = profile.paddle_subscription_id
      ? [profile.paddle_subscription_id]
      : [];

    const paddle = getPaddleInstance();

    // If customerId is not on the profile yet, attempt to find by user email
    if (!customerId && user.email) {
      try {
        const customerCollection = paddle.customers.list({
          search: user.email,
          perPage: 1,
        });
        const customer = await customerCollection.next();
        if (customer && customer.length > 0) {
          customerId = customer[0].id;
          // Save customerId to profile
          await serverClient
            .from("profiles")
            .update({ paddle_customer_id: customerId })
            .eq("id", user.id);
        }
      } catch (listErr) {
        console.warn("Error searching customer by email in Paddle:", listErr);
      }
    }

    if (!customerId) {
      return NextResponse.json(
        {
          error:
            "No billing account found. Please subscribe to a plan first before accessing the customer portal.",
        },
        { status: 400 }
      );
    }

    // 3. Create a Customer Portal session
    const session = await paddle.customerPortalSessions.create(
      customerId,
      subscriptionIds
    );

    if (!session?.urls?.general?.overview) {
      return NextResponse.json(
        { error: "Failed to generate customer portal session URL." },
        { status: 500 }
      );
    }

    // Return the one-time overview URL
    return NextResponse.json({
      success: true,
      url: session.urls.general.overview,
    });
  } catch (err: any) {
    console.error("[paddle/portal-session] Error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "Failed to open customer portal. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
