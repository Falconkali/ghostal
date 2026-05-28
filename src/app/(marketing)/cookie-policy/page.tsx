import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Cookie Policy — ${APP_NAME}`,
  description: "Learn how GhostFlow uses cookies and tracking technologies to improve our dashboard and secure user sessions.",
};

export default function CookiePolicyPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <article className="prose prose-invert max-w-none space-y-8">
          <header className="border-b border-white/5 pb-8 mb-8">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider block mb-2">Legal</span>
            <h1 id="cookie-title" className="text-4xl font-extrabold text-white tracking-tight">Cookie Policy</h1>
            <p className="text-sm text-white/40 mt-2">Last Updated: May 25, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              This Cookie Policy explains how {APP_NAME} uses cookies and similar tracking technologies to recognize you when you visit our website or log in to your creator dashboard.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. What Are Cookies?</h2>
            <p className="text-white/60 leading-relaxed">
              Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used by web developers to make websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Cookies We Use</h2>
            <p className="text-white/60 leading-relaxed">
              We use first-party and third-party cookies for several reasons:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Essential Cookies:</strong> Required to authenticate users, manage secure dashboard sessions, and prevent cross-site request forgery attacks.</li>
              <li><strong>Analytics Cookies:</strong> Help us analyze user navigation flows so we can optimize load speeds, dashboard charts, and feature responsiveness.</li>
              <li><strong>Billing Cookies:</strong> Set by our payment provider (Stripe) to secure transactions and verify subscription states.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Controlling Your Cookies</h2>
            <p className="text-white/60 leading-relaxed">
              You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our public marketing pages, but access to some dashboard features and login settings will be restricted.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Policy Updates</h2>
            <p className="text-white/60 leading-relaxed">
              We may update this policy periodically to reflect changes to the cookies we use for operational, legal, or regulatory reasons.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
