import { Environment, Paddle } from "@paddle/paddle-node-sdk";

const API_KEY = process.env.PADDLE_API_KEY!;
const paddle = new Paddle(API_KEY, { environment: Environment.production });

async function createDiscount() {
  console.log("--- PADDLE LIVE TEST SETUP ---");
  console.log("\nCreating 100% off test discount...");
  try {
    const discount = await paddle.discounts.create({
      amount: "100",
      type: "percentage",
      description: "Automated Live End-to-End Test (100% OFF)",
      enabledForCheckout: true,
      code: "TESTLIVE100",
      usageLimit: 5,
    });
    console.log("✅ Discount created successfully!");
    console.log("DISCOUNT CODE: " + discount.code);
    console.log("DISCOUNT ID: " + discount.id);
  } catch (e: any) {
    console.error("❌ Failed to create discount:", e.message);
  }
}

createDiscount();
