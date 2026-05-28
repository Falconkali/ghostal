import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `GDPR Compliance — ${APP_NAME}`,
  description: "Learn about your GDPR rights, data portability, and how to request data erasure or export at GhostFlow.",
};

export default function GdprPage() {
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
            <h1 id="gdpr-title" className="text-4xl font-extrabold text-white tracking-tight">GDPR Compliance</h1>
            <p className="text-sm text-white/40 mt-2">Last Updated: May 25, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              At {APP_NAME}, we are committed to respecting your privacy rights, including those established under the General Data Protection Regulation (GDPR) for users residing in the European Economic Area (EEA).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Your Rights Under GDPR</h2>
            <p className="text-white/60 leading-relaxed">
              As an EEA resident, you possess the following rights regarding the personal data we store:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Right of Access:</strong> You can request a full export of your personal information, media assets, and connected channel tokens.</li>
              <li><strong>Right of Rectification:</strong> You can request correction of inaccurate profile data or billing details.</li>
              <li><strong>Right of Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You can request that we permanently delete your account, connected tokens, and Content Vault history.</li>
              <li><strong>Right to Restrict Processing:</strong> You can request that we temporarily disable automation queues without fully deleting your account.</li>
              <li><strong>Right to Data Portability:</strong> You can request your data in a machine-readable format (JSON) for easy migration to other platforms.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Data Subject Access Requests (DSAR)</h2>
            <p className="text-white/60 leading-relaxed">
              To request a data export, modify permissions, or delete your entire record, please email us. We process all valid DSARs within 30 days of receiving the request and verifying your identity.
            </p>
            <a id="gdpr-email" href="mailto:privacy@ghostflow.ai" className="text-sm font-semibold text-violet-400 hover:text-violet-300">
              privacy@ghostflow.ai
            </a>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Data Security and International Transfers</h2>
            <p className="text-white/60 leading-relaxed">
              Since {APP_NAME} operates cloud infrastructure worldwide, your data may be transferred to and stored in countries outside the EEA. We enforce Standard Contractual Clauses (SCCs) to ensure equivalent data protection levels are maintained globally.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
