import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: "Read the official terms and conditions for using the Ghostal social automation platform.",
};

export default function TermsPage() {
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
            <h1 id="terms-title" className="text-4xl font-extrabold text-white tracking-tight">Terms of Service</h1>
            <p className="text-sm text-white/40 mt-2">Last Updated: July 15, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              Welcome to {APP_NAME}. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of our websites, APIs, and dashboard services. By subscribing or connecting your accounts, you agree to these Terms. If you do not agree, do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Eligibility and Age Requirement</h2>
            <p className="text-white/60 leading-relaxed">
              You must be at least <strong>18 years old</strong> to use {APP_NAME}. By using our services, you represent and warrant that you meet this age requirement. If you are under 18, you may not use the service under any circumstances. We do not knowingly provide services to minors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Account Setup and API Permissions</h2>
            <p className="text-white/60 leading-relaxed">
              To operate Ghost Mode, you must explicitly connect a professional Instagram account and grant {APP_NAME} write permissions. You represent that you are the sole legal owner of the connected channel and that your automated activity complies with Meta&apos;s developer guidelines and Instagram&apos;s Community Guidelines.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Content Ownership and AI Remix Rights</h2>
            <p className="text-white/60 leading-relaxed">
              You retain full intellectual property ownership of all media, photos, and reels uploaded to your Content Vault. By using our Caption Remix tool, you grant {APP_NAME} a limited, non-exclusive license to process and rewrite your caption text solely to generate new content for your account. We do not claim ownership of any of your content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Acceptable Conduct</h2>
            <p className="text-white/60 leading-relaxed">
              You agree not to use {APP_NAME} to:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li>Publish copyright-infringing material, spam, or malicious software links.</li>
              <li>Exceed standard API request limits or run scripts designed to bypass safety filters.</li>
              <li>Impersonate other individuals or entities without explicit legal authority.</li>
              <li>Violate any applicable local, national, or international law or regulation.</li>
              <li>Use the service in any way that could damage, disable, or impair Meta&apos;s platforms.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Billing, Cancellation, and Refunds</h2>
            <p className="text-white/60 leading-relaxed">
              {APP_NAME} offers monthly subscription plans. By subscribing, you authorize us to charge your payment method on a recurring monthly basis.
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time from the billing dashboard. Cancellation takes effect at the end of the current billing period.</li>
              <li><strong>Refunds:</strong> We offer a full refund within <strong>7 days</strong> of your initial subscription purchase if you are not satisfied. After 7 days, all payments are non-refundable. To request a refund, contact <a href="mailto:support@ghostal.xyz" className="text-violet-400 hover:underline">support@ghostal.xyz</a>.</li>
              <li><strong>Free Trials:</strong> If a free trial is offered, your subscription will automatically convert to a paid plan at the end of the trial unless cancelled beforehand.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Disclaimer of Liability</h2>
            <p className="text-white/60 leading-relaxed">
              {APP_NAME} is provided &ldquo;as is&rdquo;. While we strive to maintain 100% operational uptime and adhere to official API standards, we are not responsible for organic reach drops, account suspensions, or blockages imposed directly by Meta or other third-party networks. Our total liability to you for any claim arising out of these Terms shall not exceed the amount you paid us in the 3 months preceding the claim.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Termination</h2>
            <p className="text-white/60 leading-relaxed">
              We reserve the right to suspend or terminate your access to {APP_NAME} at our discretion if you violate these Terms or engage in conduct harmful to other users or our platform. Upon termination, your API access tokens will be deleted immediately and your scheduled posts will cease.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">8. Modifications to Terms</h2>
            <p className="text-white/60 leading-relaxed">
              We may modify these Terms at any time. We will provide at least <strong>14 days&apos; notice</strong> of material changes via email or an in-app notification. Your continued use of {APP_NAME} after the effective date of updated Terms constitutes your acceptance of the changes. If you disagree with the changes, you may cancel your subscription before they take effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">9. Governing Law and Jurisdiction</h2>
            <p className="text-white/60 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or your use of {APP_NAME} shall be subject to the exclusive jurisdiction of the courts located in India. If you are a consumer in the European Union, you may also have rights under the mandatory consumer protection laws of your country of residence.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">10. Contact</h2>
            <p className="text-white/60 leading-relaxed">
              For any questions about these Terms, contact us at{" "}
              <a href="mailto:support@ghostal.xyz" className="text-violet-400 hover:underline">support@ghostal.xyz</a>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
