import { Environment, Paddle } from "@paddle/paddle-node-sdk";

// Use the key passed via environment variable
const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.production, // We are LIVE!
});

async function seed() {
  console.log("Creating Paddle products and prices...");

  // 1. Starter Plan
  const starterProduct = await paddle.products.create({
    name: "Starter",
    taxCategory: "saas",
    description: "For new creators getting started.",
  });
  const starterPrice = await paddle.prices.create({
    productId: starterProduct.id,
    description: "Starter Monthly USD",
    unitPrice: { amount: "900", currencyCode: "USD" }, // $9.00
    billingCycle: { interval: "month", frequency: 1 },
    trialPeriod: { interval: "day", frequency: 14 },
  });

  // 2. Creator Pro Plan
  const proProduct = await paddle.products.create({
    name: "Creator Pro",
    taxCategory: "saas",
    description: "For serious creators needing automation.",
  });
  const proPrice = await paddle.prices.create({
    productId: proProduct.id,
    description: "Creator Pro Monthly USD",
    unitPrice: { amount: "2900", currencyCode: "USD" }, // $29.00
    billingCycle: { interval: "month", frequency: 1 },
    trialPeriod: { interval: "day", frequency: 14 },
  });

  // 3. Survival AI Plan
  const survivalProduct = await paddle.products.create({
    name: "Survival AI",
    taxCategory: "saas",
    description: "Full autopilot and analytics.",
  });
  const survivalPrice = await paddle.prices.create({
    productId: survivalProduct.id,
    description: "Survival AI Monthly USD",
    unitPrice: { amount: "4900", currencyCode: "USD" }, // $49.00
    billingCycle: { interval: "month", frequency: 1 },
    trialPeriod: { interval: "day", frequency: 14 },
  });

  // 4. Lifetime Plan
  const lifetimeProduct = await paddle.products.create({
    name: "Lifetime Access",
    taxCategory: "saas",
    description: "Pay once, use forever.",
  });
  const lifetimePrice = await paddle.prices.create({
    productId: lifetimeProduct.id,
    description: "Lifetime One-time USD",
    unitPrice: { amount: "9900", currencyCode: "USD" }, // $99.00
  });

  console.log("\n✅ Successfully created catalog!\n");
  console.log(
    JSON.stringify(
      {
        NEXT_PUBLIC_PADDLE_PRICE_STARTER: starterPrice.id,
        NEXT_PUBLIC_PADDLE_PRICE_CREATOR_PRO: proPrice.id,
        NEXT_PUBLIC_PADDLE_PRICE_SURVIVAL_AI: survivalPrice.id,
        NEXT_PUBLIC_PADDLE_PRICE_LIFETIME: lifetimePrice.id,
      },
      null,
      2,
    ),
  );
}

seed().catch((e) => {
  console.error("Failed to seed catalog:", e);
  process.exit(1);
});
