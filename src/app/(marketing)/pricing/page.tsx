import Pricing from "@/components/landing/pricing";

export const metadata = {
  title: "Pricing & Plans — Ghostal",
  description: "Simple, transparent pricing for AI content continuity. Pick the plan that fits your growth.",
};

export default function PricingPage() {
  return (
    <div className="pt-20">
      <Pricing />
    </div>
  );
}
