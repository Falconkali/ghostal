import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Refund Policy — ${APP_NAME}`,
  description: "Read the official refund and cancellation policy for the Ghostal platform.",
};

export default function RefundsPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] right-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <article className="prose prose-invert max-w-none space-y-8">
          <header className="border-b border-white/5 pb-8 mb-8">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider block mb-2">Legal</span>
            <h1 id="refunds-title" className="text-4xl font-extrabold text-white tracking-tight">Refund Policy</h1>
            <p className="text-sm text-white/40 mt-2">Last Updated: July 17, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              At {APP_NAME}, we want you to be completely satisfied with your purchase. This Refund Policy outlines the terms and conditions under which you may be eligible for a refund.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Subscription Plans (Monthly)</h2>
            <p className="text-white/60 leading-relaxed">
              For our monthly subscription plans (Starter, Creator Pro, Survival AI):
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Initial Purchase:</strong> We offer a full refund within <strong>7 days</strong> of your initial subscription purchase if you are not satisfied with the platform.</li>
              <li><strong>Renewals:</strong> Because you can cancel your subscription at any time prior to renewal, we do not offer refunds for automatic subscription renewals after the charge has been processed.</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time from your billing dashboard. Your access will remain active until the end of your current billing period.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Lifetime Deals (One-Time Payment)</h2>
            <p className="text-white/60 leading-relaxed">
              For our one-time payment Lifetime Access plans:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li>We offer a full refund within <strong>7 days</strong> of your purchase if you decide the platform isn't right for you.</li>
              <li>After 7 days, all lifetime plan purchases are final and non-refundable.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. How to Request a Refund</h2>
            <p className="text-white/60 leading-relaxed">
              To request a refund within the eligible period, please contact our support team at <a href="mailto:support@ghostal.xyz" className="text-violet-400 hover:underline">support@ghostal.xyz</a> with your account email and order details. We process refund requests within 1-3 business days.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Abuse of Refund Policy</h2>
            <p className="text-white/60 leading-relaxed">
              If we determine that an account is abusing our refund policy (e.g., repeatedly purchasing and refunding, or engaging in fraudulent activity), we reserve the right to refuse the refund and permanently suspend the account.
            </p>
          </section>

        </article>
      </div>
    </div>
  );
}
