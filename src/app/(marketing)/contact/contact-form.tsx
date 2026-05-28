"use client";

import { useState } from "react";
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("contact_messages").insert({
        name,
        email,
        subject,
        message,
      });

      if (insertError) throw insertError;

      setIsSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Error submitting contact form:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#12121a] p-8 md:p-10 text-center relative overflow-hidden backdrop-blur-xl flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute top-0 right-0 h-[200px] w-[200px] rounded-full bg-emerald-500/5 blur-[50px]" />
        
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">Message Sent Successfully!</h2>
        <p className="max-w-md text-sm text-zinc-400 leading-relaxed mb-8">
          Thank you for reaching out. A copy of your inquiry has been recorded, and our support team will review it and get back to you shortly.
        </p>
        
        <button
          onClick={() => setIsSuccess(false)}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <section className="lg:col-span-3 rounded-2xl border border-white/5 bg-[#12121a] p-8 md:p-10 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />
      
      <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
      
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} id="contact-form" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contact-name" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="contact-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="contact-email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
            Inquiry Topic
          </label>
          <div className="relative">
            <select
              id="contact-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full rounded-xl border border-white/5 bg-[#12121a] px-4 py-3 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 appearance-none"
            >
              <option value="" disabled>Select an option...</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Billing & Subscription">Billing &amp; Subscription</option>
              <option value="Technical Support">Technical Support</option>
              <option value="API / Enterprise Packages">API / Enterprise Packages</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
            How can we help you?
          </label>
          <textarea
            id="contact-message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you need support with..."
            className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <button
          type="submit"
          id="contact-submit"
          disabled={isLoading}
          className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending message...
            </span>
          ) : (
            <>
              Send Message
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
