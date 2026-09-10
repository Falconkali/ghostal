import {
  type Paddle,
  type PricePreviewParams,
  type PricePreviewResponse,
} from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import { PricingTier } from "@/constants/pricing-tier";

export type PaddlePrices = Record<string, string>;

function getLineItems(): PricePreviewParams["items"] {
  return PricingTier.flatMap((tier) =>
    [tier.priceId.month, tier.priceId.year]
      .filter(Boolean)
      .map((priceId) => ({
        priceId,
        quantity: 1,
      }))
  );
}

function getPriceAmounts(prices: PricePreviewResponse): PaddlePrices {
  if (!prices?.data?.details?.lineItems) return {};
  return prices.data.details.lineItems.reduce<PaddlePrices>((acc, item) => {
    // Only use formattedTotals.total directly from Paddle
    acc[item.price.id] = item.formattedTotals.total;
    return acc;
  }, {});
}

export function usePaddlePrices(
  paddle: Paddle | undefined,
  country?: string
): { prices: PaddlePrices; loading: boolean } {
  const [prices, setPrices] = useState<PaddlePrices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paddle) return;

    const items = getLineItems();
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    const params: Partial<PricePreviewParams> = {
      items,
      // 'OTHERS' is an internal app-side sentinel meaning "let Paddle infer from IP"
      // NEVER pass 'OTHERS' to Paddle as a country code
      ...(country && country !== "OTHERS" && { address: { countryCode: country } }),
    };

    setLoading(true);
    paddle
      .PricePreview(params as PricePreviewParams)
      .then((response) => {
        setPrices((prev) => ({ ...prev, ...getPriceAmounts(response) }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Paddle PricePreview failed:", err);
        setLoading(false);
      });
  }, [country, paddle]);

  return { prices, loading };
}
