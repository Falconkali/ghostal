import { Mail, Clock, ShieldAlert } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import ContactForm from "./contact-form";

export const metadata = {
  title: `Contact Us — ${APP_NAME}`,
  description: "Get in touch with our team for general questions, technical support, or enterprise pricing inquiry.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            Contact
          </span>
          <h1 id="contact-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Have questions about our survival plans, custom AI training, or need help? We are online and ready to assist.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Contact Details (2/5 cols) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Customer Support</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-2">
                  Need help with your account, scheduling, or content vault?
                </p>
                <a id="support-email" href="mailto:support@ghostflow.ai" className="text-sm font-semibold text-violet-400 hover:text-violet-300">
                  support@ghostflow.ai
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Operational Hours</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Our core support team operates Monday – Friday, 9:00 AM – 6:00 PM EST. We typically reply within 2-4 hours.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Status Updates</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-2">
                  Check our status dashboard for system health.
                </p>
                <a href="/status" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">
                  Check System Status &rarr;
                </a>
              </div>
            </div>
          </section>

          {/* Form (3/5 cols) */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
