import Hero from "@/components/landing/hero";
import Problem from "@/components/landing/problem";
import Comparison from "@/components/landing/comparison";
import Features from "@/components/landing/features";
import ComingSoon from "@/components/landing/coming-soon";
import Testimonials from "@/components/landing/testimonials";
import Pricing from "@/components/landing/pricing";
import FinalCTA from "@/components/landing/final-cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Problem />
      <Comparison />
      <Features />
      <ComingSoon />
      <Testimonials />
      <Pricing />
      <FinalCTA />
    </>
  );
}
