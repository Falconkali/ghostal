"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface PaddleButtonProps {
  priceId: string;
  label?: string;
  highlighted?: boolean;
  isLifetime?: boolean;
}

export default function PaddleButton({
  priceId,
  label = "Pay with Paddle",
  highlighted = false,
  isLifetime = false,
}: PaddleButtonProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) return;
    initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.trim(),
      environment: (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "production").trim() as
        | "sandbox"
        | "production",
    })
      .then((p) => p && setPaddle(p))
      .catch((err) => console.error("Paddle initialization failed:", err));
  }, []);

  function openCheckout() {
    const targetPriceId = (
      priceId && !priceId.startsWith("REPLACE")
        ? priceId
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME || "pri_01kxrhwbqhb3hmag064xxbxqkc"
    ).trim();

    if (!paddle || !targetPriceId) {
      alert("Paddle SDK is loading. Please try again in a moment.");
      return;
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "https://ghostal.xyz";

    setLoading(true);
    try {
      paddle.Checkout.open({
        items: [{ priceId: targetPriceId, quantity: 1 }],
        customData: { userId: user?.id ?? "" },
        customer: user?.email ? { email: user.email } : undefined,
        settings: {
          variant: "one-page",
          displayMode: "overlay",
          theme: "dark",
          allowLogout: !user?.email,
          successUrl: `${siteUrl}/welcome?plan=Founding%20Member%20Lifetime&cycle=lifetime`,
        },
      });
    } catch (err) {
      console.error("Paddle Checkout.open failed:", err);
      setLoading(false);
    }
    setTimeout(() => setLoading(false), 3000);
  }

  // Don't render button if no client token configured yet
  if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) return null;

  return (
    <button
      onClick={openCheckout}
      disabled={loading || !paddle}
      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isLifetime || highlighted
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
            : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
        }`}
    >
      <Zap className="h-3.5 w-3.5 fill-current" />
      {loading ? "Opening…" : label}
    </button>
  );
}
