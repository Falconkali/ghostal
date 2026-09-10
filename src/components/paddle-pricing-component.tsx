"use client";

import { useEffect, useState, useRef } from "react";
import {
  initializePaddle,
  type Paddle,
  type Environments,
} from "@paddle/paddle-js";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingTier, type Tier } from "@/constants/pricing-tier";
import { usePaddlePrices } from "@/hooks/use-paddle-prices";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  country?: string;
}

function computeDisplayedPrice(
  formattedPrice: string | null,
  frequency: "month" | "year",
  isSamePriceId: boolean
): { display: string | null; monthlyEquivalent: string | null } {
  if (!formattedPrice) return { display: null, monthlyEquivalent: null };
  if (frequency === "month") return { display: formattedPrice, monthlyEquivalent: null };

  // If a distinct annual price ID exists from Paddle, use formattedPrice directly
  if (!isSamePriceId) return { display: formattedPrice, monthlyEquivalent: null };

  // Parse currency symbol and numeric value
  const match = formattedPrice.match(/^([^\d\s,-]*)\s*([\d,.]+)/);
  if (!match) return { display: formattedPrice, monthlyEquivalent: null };

  const symbol = match[1] || "";
  const rawNumStr = match[2].replace(/,/g, "");
  const monthlyVal = parseFloat(rawNumStr);

  if (isNaN(monthlyVal)) return { display: formattedPrice, monthlyEquivalent: null };

  // 20% discount on annual total: (monthlyVal * 12 * 0.8)
  const annualTotal = (monthlyVal * 12 * 0.8).toFixed(2);
  const monthlyEquivalent = (monthlyVal * 0.8).toFixed(2);

  const formattedAnnual = annualTotal.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formattedMonthlyEq = monthlyEquivalent.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return {
    display: `${symbol}${formattedAnnual}`,
    monthlyEquivalent: `${symbol}${formattedMonthlyEq}`,
  };
}

const DEFAULT_USD_PRICES: Record<string, { month: string; year: string }> = {
  Starter: { month: "$9.00", year: "$86.40" },
  Pro: { month: "$29.00", year: "$278.40" },
  Advanced: { month: "$49.00", year: "$470.40" },
};

export function PaddlePricing({ country = "OTHERS" }: Props) {
  const [frequency, setFrequency] = useState<"month" | "year">("month");
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [paddleError, setPaddleError] = useState<string | null>(null);
  const [subscribingPriceId, setSubscribingPriceId] = useState<string | null>(null);
  const { user } = useAuth();

  const selectedPlanRef = useRef<{ name: string; cycle: string }>({
    name: "Pro",
    cycle: "month",
  });
  const paymentSuccessRef = useRef<boolean>(false);

  const { prices, loading } = usePaddlePrices(paddle, country);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV as Environments;

    if (!token) {
      const err =
        "CRITICAL CONFIG ERROR: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN environment variable is not set!";
      console.error(err);
      setPaddleError(err);
      return;
    }

    if (!environment) {
      const err =
        "CRITICAL CONFIG ERROR: NEXT_PUBLIC_PADDLE_ENV environment variable is not set! Set to 'sandbox' or 'production'.";
      console.error(err);
      setPaddleError(err);
      return;
    }

    initializePaddle({
      token,
      environment,
      eventCallback: (event) => {
        console.log("Paddle Event:", event.name, event.data);

        // Catch payment completion / checkout completed events
        const eventName = (event.name as string) || "";
        if (
          eventName === "checkout.completed" ||
          eventName === "checkout.payment.completed" ||
          eventName.includes("completed")
        ) {
          paymentSuccessRef.current = true;
          const { name, cycle } = selectedPlanRef.current;
          window.location.href = `/welcome?plan=${encodeURIComponent(name)}&cycle=${cycle}`;
        }

        // If overlay is closed after payment action succeeded
        if (eventName === "checkout.closed" && paymentSuccessRef.current) {
          const { name, cycle } = selectedPlanRef.current;
          window.location.href = `/welcome?plan=${encodeURIComponent(name)}&cycle=${cycle}`;
        }
      },
    })
      .then((instance) => {
        if (instance) {
          setPaddle(instance);
        }
      })
      .catch((err) => {
        console.error("Paddle initialization failed:", err);
        setPaddleError("Failed to initialize Paddle SDK.");
      });

    // Window focus fallback for external popups (e.g. UPI mandate completion popup)
    const handleWindowFocus = () => {
      if (paymentSuccessRef.current) {
        const { name, cycle } = selectedPlanRef.current;
        window.location.href = `/welcome?plan=${encodeURIComponent(name)}&cycle=${cycle}`;
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const handleSubscribe = (tier: Tier) => {
    const priceId = tier.priceId[frequency]?.trim();

    if (!paddle) {
      alert("Paddle SDK is still loading. Please try again in a moment.");
      return;
    }

    if (!priceId) {
      alert(
        `Price ID for ${tier.name} (${frequency}ly) is missing. Please configure your environment variables.`
      );
      return;
    }

    selectedPlanRef.current = { name: tier.name, cycle: frequency };
    paymentSuccessRef.current = false;
    setSubscribingPriceId(priceId);

    const siteUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ghostal.xyz";

    const successUrl = `${siteUrl}/welcome?plan=${encodeURIComponent(tier.name)}&cycle=${frequency}`;

    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        settings: {
          displayMode: "overlay",
          variant: "one-page",
          theme: "dark",
          allowLogout: !user?.email,
          successUrl,
        },
      });
    } catch (err) {
      console.error("Paddle Checkout.open error:", err);
    } finally {
      setTimeout(() => setSubscribingPriceId(null), 2000);
    }
  };

  if (paddleError) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
        <p className="font-bold text-sm">{paddleError}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Billing Frequency Toggle */}
      <div className="mb-12 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#0d0d16] p-1.5 backdrop-blur-xl">
          <button
            onClick={() => setFrequency("month")}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer",
              frequency === "month"
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20"
                : "text-white/60 hover:text-white"
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setFrequency("year")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer",
              frequency === "year"
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20"
                : "text-white/60 hover:text-white"
            )}
          >
            Annual Billing
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black text-emerald-400">
              Save ~20%
            </span>
          </button>
        </div>
      </div>

      {/* 3-Tier Grid */}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {PricingTier.map((tier) => {
          const priceId = tier.priceId[frequency];
          const rawFormattedPrice = priceId ? prices[priceId] : null;
          const isSamePriceId = tier.priceId.month === tier.priceId.year;
          const { display: computedDisplay, monthlyEquivalent } = computeDisplayedPrice(
            rawFormattedPrice,
            frequency,
            isSamePriceId
          );

          const defaultFallback = DEFAULT_USD_PRICES[tier.name]?.[frequency] ?? "$9.00";
          const formattedPrice = computedDisplay || defaultFallback;
          const isSubscribing = subscribingPriceId === priceId;

          return (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition-all duration-300 backdrop-blur-xl",
                tier.featured
                  ? "border-violet-500/50 bg-gradient-to-b from-violet-950/40 via-[#0e0c1a] to-cyan-950/30 shadow-2xl shadow-violet-500/20 scale-[1.02] md:scale-[1.03]"
                  : "border-white/10 bg-[#0c0c14]/90 hover:border-white/20"
              )}
            >
              {tier.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-violet-500/30">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/55 min-h-[32px]">
                  {tier.description}
                </p>

                {/* Price Display */}
                <div className="mt-6">
                  {frequency === "year" && (
                    <div className="mb-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      ⚡ 20% Annual Discount Applied
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      {formattedPrice}
                    </span>
                    <span className="text-xs font-medium text-white/40">
                      /{frequency === "year" ? "yr" : "mo"}
                    </span>
                  </div>
                  {frequency === "year" && (
                    <div className="mt-1 text-[11px] font-semibold text-emerald-400/90">
                      {monthlyEquivalent ? `${monthlyEquivalent}/mo · ` : ""}Billed annually (2 months free)
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="mt-8 space-y-3 border-t border-white/10 pt-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-white/80">
                      <div
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          tier.featured
                            ? "bg-violet-500/20 text-violet-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        )}
                      >
                        <Check className="h-2.5 w-2.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe CTA Button */}
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loading || isSubscribing}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                    tier.featured
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/10 text-white border border-white/15 hover:bg-white/15"
                  )}
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  {isSubscribing ? "Opening Checkout..." : `Subscribe to ${tier.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Policy Footnote */}
      <div className="mt-10 text-center text-xs text-white/30 space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 inline" />
          <span>100% Tax Compliant &amp; Secure via Paddle (Merchant of Record)</span>
        </p>
        <p>14-day money-back guarantee · Instant auto-activation · Cancel anytime</p>
      </div>
    </div>
  );
}
