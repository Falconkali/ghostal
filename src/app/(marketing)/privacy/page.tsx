import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: "Learn how we protect and manage your data, personal information, and social access tokens at GhostFlow.",
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <article className="prose prose-invert max-w-none space-y-8">
          <header className="border-b border-white/5 pb-8 mb-8">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider block mb-2">Legal</span>
            <h1 id="privacy-title" className="text-4xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-white/40 mt-2">Last Updated: May 25, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              At {APP_NAME}, we take your privacy and the security of your creative property seriously. This Privacy Policy describes how we collect, use, and process your personal data and social credentials when you use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            <p className="text-white/60 leading-relaxed">
              We collect information to provide a stable, autonomous continuity system for your accounts:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Account Credentials:</strong> Email, username, profile identifiers, and authentication tokens via standard Meta OAuth login flows.</li>
              <li><strong>Media and Captions:</strong> Images, videos, and captions you upload to your Content Vault or include in your publishing schedule.</li>
              <li><strong>Usage Vitals:</strong> Login frequency, scheduling patterns, and interaction metrics used by our inactivity detection engine.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. How We Use Your Data</h2>
            <p className="text-white/60 leading-relaxed">
              We process your data strictly to maintain your creator continuity:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li>To detect posting inactivity and trigger Ghost Mode survival queues.</li>
              <li>To run AI caption remixing algorithms on your historical post data.</li>
              <li>To publish scheduled posts to connected social platforms on your behalf.</li>
              <li>To provide support and prevent unauthorized access or API rate breaches.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Token and Credential Security</h2>
            <p className="text-white/60 leading-relaxed">
              Your social tokens are encrypted at rest using AES-256 and transmitted securely using Transport Layer Security (TLS). We do not store or read your personal account passwords. We only hold the limited access tokens granted during Meta verification.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Data Sharing and Retention</h2>
            <p className="text-white/60 leading-relaxed">
              We do not sell, rent, or trade your creative media or personal information. Your content is kept on secure cloud servers and deleted within 30 days of account termination.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Contact Us</h2>
            <p className="text-white/60 leading-relaxed">
              If you have any questions or data removal requests regarding this policy, email us at:
            </p>
            <a id="privacy-email" href="mailto:privacy@ghostflow.ai" className="text-sm font-semibold text-violet-400 hover:text-violet-300">
              privacy@ghostflow.ai
            </a>
          </section>
        </article>
      </div>
    </div>
  );
}
