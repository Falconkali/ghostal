import { Trash2, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export const metadata = {
  title: `Data Deletion Instructions — ${APP_NAME}`,
  description: "Learn how to request deletion of your account and personal data from GhostFlow.",
};

export default function DataDeletionPage() {
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
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider block mb-2">Compliance</span>
            <h1 id="deletion-title" className="text-4xl font-extrabold text-white tracking-tight">Data Deletion Instructions</h1>
            <p className="text-sm text-white/40 mt-2">Last Updated: May 28, 2026</p>
          </header>

          <section className="space-y-4">
            <p className="text-white/60 leading-relaxed">
              At {APP_NAME}, we value your privacy and give you full control over your data. In compliance with the Meta Platform Policy, we provide simple ways for users to request the permanent deletion of their account data, profile details, and connected social media authorization tokens.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white">How to Delete Your Data</h2>
            <p className="text-white/60 leading-relaxed">
              You can permanently remove your personal details, connected Instagram accounts, content vault assets, and scheduled posts using one of the following methods:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Method 1 */}
              <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-violet-600/5 blur-xl group-hover:bg-violet-600/10 transition-colors" />
                <Trash2 className="h-8 w-8 text-violet-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Option A: Self-Service Deletion</h3>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  Delete everything instantly through your dashboard account settings:
                </p>
                <ol className="list-decimal pl-4 text-xs text-white/45 space-y-1.5 mb-4">
                  <li>Log in to your {APP_NAME} account.</li>
                  <li>Navigate to the <strong>Settings</strong> page from the sidebar.</li>
                  <li>In the <strong>Profile</strong> tab, scroll down to the <strong>Danger Zone</strong>.</li>
                  <li>Click <strong>Delete Account</strong> and confirm your choice.</li>
                </ol>
                <span className="text-[10px] text-emerald-400 font-semibold block">✓ Immediate &amp; Permanent</span>
              </div>

              {/* Method 2 */}
              <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-colors" />
                <Mail className="h-8 w-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Option B: Email Support Request</h3>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  Send a manual deletion request to our compliance team:
                </p>
                <ol className="list-decimal pl-4 text-xs text-white/45 space-y-1.5 mb-4">
                  <li>Compose an email from your registered address.</li>
                  <li>Send it to: <a href="mailto:privacy@ghostflow.ai" className="text-violet-400 hover:underline">privacy@ghostflow.ai</a></li>
                  <li>Use the subject line: <strong>Data Deletion Request</strong>.</li>
                  <li>We will verify and process it within 24–48 hours.</li>
                </ol>
                <span className="text-[10px] text-zinc-400 font-semibold block">🕒 Processed within 48 Hours</span>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-white/5 pt-8">
            <h2 className="text-xl font-bold text-white">What Data is Deleted?</h2>
            <p className="text-white/60 leading-relaxed">
              When an account is deleted, we execute a cascading purge from our database and storage buckets. The following information is permanently destroyed and cannot be recovered:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/50">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                Meta OAuth Access Tokens &amp; Permissions
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                Linked Instagram Account Identifiers
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                All Uploaded Photos, Videos &amp; Reels
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                Custom Scheduled Post Records &amp; Queue
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                Historical AI Caption Remix Logs
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                Profile Details &amp; Billing History
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">Revoking Permissions via Facebook</h2>
            <p className="text-white/60 leading-relaxed">
              Alternatively, you can revoke {APP_NAME}&apos;s access to your Instagram account directly from your Facebook settings:
            </p>
            <ol className="list-decimal pl-6 text-sm text-white/50 space-y-2">
              <li>Go to your Facebook Account settings page.</li>
              <li>Click on <strong>Business Integrations</strong>.</li>
              <li>Find <strong>{APP_NAME}</strong> in the list and click <strong>Remove</strong>.</li>
            </ol>
          </section>
        </article>
      </div>
    </div>
  );
}
