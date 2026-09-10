import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description:
    "Learn how we protect and manage your data, personal information, and social access tokens at Ghostal.",
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
            <p className="text-sm text-white/40 mt-2">Last Updated: July 15, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              At {APP_NAME}, we take your privacy and the security of your creative property seriously. This Privacy Policy describes how we collect, use, and process your personal data and social credentials when you use our services. By using {APP_NAME}, you agree to the practices described in this policy.
            </p>
          </section>

          {/* ── Section 1 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            <p className="text-white/60 leading-relaxed">
              We collect information to provide a stable, autonomous continuity system for your accounts:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Account Credentials:</strong> Email address, display name, and hashed password for your {APP_NAME} account.</li>
              <li><strong>Instagram Data (via Meta OAuth):</strong> When you connect your Instagram account, we access and store:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Your Instagram <strong>username</strong> and <strong>display name</strong></li>
                  <li>Your Instagram <strong>user ID</strong> (app-scoped identifier assigned by Meta)</li>
                  <li>Your Instagram <strong>media count</strong> (number of posts)</li>
                  <li>Your Instagram <strong>follower count</strong> (fetched at connection time)</li>
                  <li>An encrypted <strong>access token</strong> to publish content and read profile data on your behalf</li>
                </ul>
              </li>
              <li><strong>Media and Captions:</strong> Images, videos, and captions you upload to your Content Vault or include in your publishing schedule.</li>
              <li><strong>Usage Vitals:</strong> Login frequency, scheduling patterns, and interaction metrics used by our inactivity detection engine.</li>
              <li><strong>Automatically Collected Data:</strong> IP addresses, browser type, and standard server log information for security and debugging purposes.</li>
            </ul>
          </section>

          {/* ── Section 2 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. How We Use Your Data</h2>
            <p className="text-white/60 leading-relaxed">
              We process your data strictly to maintain your creator continuity:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li>To publish scheduled posts and automated survival queue posts to your connected Instagram account on your behalf.</li>
              <li>To detect posting inactivity and trigger Ghost Mode survival queues.</li>
              <li>To run AI caption remixing algorithms on your historical post data.</li>
              <li>To provide analytics on your posting consistency and queue health.</li>
              <li>To provide support and prevent unauthorized access or API rate breaches.</li>
              <li>To send transactional emails (e.g., queue warnings, account alerts) when you have opted in.</li>
            </ul>
            <p className="text-white/60 leading-relaxed">
              We <strong>do not</strong> use your Instagram data to train third-party AI models, sell to advertisers, or share with any third party except as described in Section 4.
            </p>
          </section>

          {/* ── Section 3 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Instagram / Meta Platform Data</h2>
            <p className="text-white/60 leading-relaxed">
              {APP_NAME} uses the <strong>Instagram Graph API</strong> (provided by Meta Platforms, Inc.) to connect and publish to your Instagram account. By connecting your Instagram account, you authorize {APP_NAME} to:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li>Read your Instagram profile information including username, user ID, media count, and follower count (<code>instagram_business_basic</code> permission).</li>
              <li>Publish photos, videos, and reels to your Instagram feed on your behalf (<code>instagram_business_content_publish</code> permission).</li>
            </ul>
            <p className="text-white/60 leading-relaxed">
              We do not request or use any permissions beyond the two listed above. We do not access your Instagram password, private messages, or any data not explicitly listed here. Your access token is encrypted at rest using AES-256-GCM and is never shared with third parties.
            </p>
            <p className="text-white/60 leading-relaxed">
              This application is built in compliance with the{" "}
              <a href="https://developers.facebook.com/terms" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Meta Platform Terms</a>{" "}
              and{" "}
              <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Meta Developer Policies</a>.
            </p>
          </section>

          {/* ── Section 4 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">4. Token Security and Revocation</h2>
            <p className="text-white/60 leading-relaxed">
              Your Instagram access tokens are:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li>Encrypted at rest using <strong>AES-256-GCM</strong> before being stored in our database.</li>
              <li>Transmitted securely using <strong>Transport Layer Security (TLS 1.2+)</strong>.</li>
              <li>Never logged, displayed in plaintext, or shared with any third party.</li>
              <li>Instagram long-lived tokens are valid for 60 days from issuance. You will need to reconnect your account when a token expires.</li>
            </ul>
            <p className="text-white/60 leading-relaxed">
              <strong>To revoke access at any time</strong>, you can:
            </p>
            <ol className="list-decimal pl-6 text-white/50 space-y-2">
              <li>Go to <strong>Settings → Instagram</strong> in your {APP_NAME} dashboard and click <strong>Disconnect Instagram</strong>. This immediately deletes your stored token.</li>
              <li>Alternatively, go to your Facebook Account Settings → <strong>Business Integrations</strong>, find {APP_NAME}, and click <strong>Remove</strong>. This revokes the token at Meta&apos;s level and triggers our automated data deletion callback.</li>
            </ol>
            <p className="text-white/60 leading-relaxed">
              Upon token revocation, {APP_NAME} will no longer be able to publish to your account. Any scheduled posts in the queue will be cancelled.
            </p>
          </section>

          {/* ── Section 5 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">5. Data Sharing and Retention</h2>
            <p className="text-white/60 leading-relaxed">
              We do not sell, rent, or trade your creative media or personal information. We work with the following categories of third-party processors:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Supabase</strong> — our database and authentication provider (data stored in EU/US regions).</li>
              <li><strong>Vercel</strong> — our hosting provider. Server logs may be retained for up to 30 days.</li>
              <li><strong>Meta Platforms, Inc.</strong> — the Instagram Graph API provider used to publish your content.</li>
            </ul>
            <p className="text-white/60 leading-relaxed">
              <strong>Retention:</strong> Your data is retained for as long as your account is active. Upon account deletion, all personal data, Instagram tokens, vault items, scheduled posts, and activity logs are permanently purged immediately. For deletion requests submitted via email, processing is completed within <strong>30 days</strong> of identity verification. When deletion is triggered automatically via Meta&apos;s data deletion callback (e.g., revoking app access from Facebook Settings), your data is purged immediately.
            </p>
          </section>

          {/* ── Section 6 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">6. Legal Basis for Processing (GDPR)</h2>
            <p className="text-white/60 leading-relaxed">
              For users in the European Economic Area (EEA) and United Kingdom, we process your personal data on the following legal bases:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Contract Performance:</strong> Processing your data is necessary to deliver the scheduling, autopilot, and publishing services you subscribed to.</li>
              <li><strong>Consent:</strong> When you connect your Instagram account via OAuth, you explicitly consent to {APP_NAME} accessing and publishing to it on your behalf.</li>
              <li><strong>Legitimate Interests:</strong> We process server log data to maintain security, prevent fraud, and debug service issues.</li>
              <li><strong>Legal Obligation:</strong> We may retain certain data where required by applicable law (e.g., billing records for tax compliance).</li>
            </ul>
          </section>

          {/* ── Section 7 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">7. Your Rights</h2>
            <p className="text-white/60 leading-relaxed">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 text-white/50 space-y-2">
              <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete personal data.</li>
              <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of your personal data. You can do this directly from <strong>Settings → Profile → Delete Account</strong>, or by emailing us.</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Right to Object:</strong> Object to processing of your data for certain purposes.</li>
              <li><strong>Right to Withdraw Consent:</strong> Disconnect your Instagram account at any time to withdraw consent for OAuth-based processing.</li>
            </ul>
            <p className="text-white/60 leading-relaxed">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@ghostal.xyz" className="text-violet-400 hover:underline">support@ghostal.xyz</a>.
              We will respond within 30 days.
            </p>
          </section>

          {/* ── Section 8 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">8. Cookies</h2>
            <p className="text-white/60 leading-relaxed">
              We use strictly necessary session cookies to keep you logged in to {APP_NAME}. We do not use advertising cookies or third-party tracking pixels. You can view our full{" "}
              <a href="/cookie-policy" className="text-violet-400 hover:underline">Cookie Policy here</a>.
            </p>
          </section>

          {/* ── Section 9 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">9. Children&apos;s Privacy</h2>
            <p className="text-white/60 leading-relaxed">
              {APP_NAME} is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
            </p>
          </section>

          {/* ── Section 10 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">10. Changes to This Policy</h2>
            <p className="text-white/60 leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last Updated&rdquo; date at the top. For material changes, we will notify you by email or via an in-app banner.
            </p>
          </section>

          {/* ── Section 11 ── */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">11. Contact Us</h2>
            <p className="text-white/60 leading-relaxed">
              If you have any questions, data removal requests, or concerns regarding this policy, contact our privacy team:
            </p>
            <a id="privacy-email" href="mailto:support@ghostal.xyz" className="text-sm font-semibold text-violet-400 hover:text-violet-300">
              support@ghostal.xyz
            </a>
            <p className="text-white/60 leading-relaxed mt-2">
              For data deletion requests specifically, visit our{" "}
              <a href="/data-deletion" className="text-violet-400 hover:underline">Data Deletion Instructions</a> page.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
