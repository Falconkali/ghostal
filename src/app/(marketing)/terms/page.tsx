import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: "Read the official terms and conditions for using the GhostFlow social automation platform.",
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
            <p className="text-sm text-white/40 mt-2">Last Updated: May 25, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              Welcome to {APP_NAME}. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of our websites, APIs, and dashboard services. By subscribing or connecting your accounts, you agree to these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Account Setup and API Permissions</h2>
            <p className="text-white/60 leading-relaxed">
              To operate Ghost Mode, you must explicitly connect a professional Instagram account and grant {APP_NAME} write permissions. You represent that you are the sole legal owner of the connected channel and that your automated activity complies with Meta&apos;s developer guidelines.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Content Ownership and AI Remix Rights</h2>
            <p className="text-white/60 leading-relaxed">
              You retain full intellectual property ownership of all media, photos, and reels uploaded to your Content Vault. By using our Caption Remix tool, you grant {APP_NAME} a limited license to process and rewrite your caption text solely to generate new content for your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Acceptable Conduct</h2>
            <p className="text-white/60 leading-relaxed">
              You agree not to use {APP_NAME} to:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li>Publish copyright-infringing material, spam, or malicious software links.</li>
              <li>Exceed standard API request limits or run scripts designed to bypass safety filters.</li>
              <li>Impersonate other individuals or entities without explicit legal authority.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Disclaimer of Liability</h2>
            <p className="text-white/60 leading-relaxed">
              {APP_NAME} is provided &ldquo;as is&rdquo;. While we strive to maintain 100% operational uptime and adhere to official API standards, we are not responsible for organic reach drops, account suspensions, or blockages imposed directly by Meta or other third-party networks.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Termination and Fees</h2>
            <p className="text-white/60 leading-relaxed">
              We bill services monthly. You can cancel your subscription at any time via the billing dashboard. Upon cancellation, your API access tokens will be deleted immediately and your scheduled survival posts will cease.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
