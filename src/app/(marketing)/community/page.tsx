import { MessageSquare, Calendar, Users, Award, ExternalLink, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Creator Community — ${APP_NAME}`,
  description: "Join the GhostFlow Discord community. Connect with top creators, share social growth strategies, and join masterclasses.",
};

const events = [
  {
    title: "Remixing Evergreen Content Without Fatigue",
    date: "Wednesday, May 28",
    time: "2:00 PM EST",
    host: "Marcus Vane (Head of Creator Relations)",
    description: "A deep dive workshop on cataloging old reels and setting up caption variations that convert.",
  },
  {
    title: "Social Growth Q&A: Overcoming Algorithm Decay",
    date: "Friday, June 05",
    time: "4:00 PM EST",
    host: "Alex Sterling (Co-Founder & CEO)",
    description: "Bring your analytics screenshots. We will review accounts live and talk momentum strategies.",
  },
];

export default function CommunityPage() {
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
            Community
          </span>
          <h1 id="community-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            The <span className="gradient-text">Creator Community</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            A high-signal network of 15,000+ professional creators sharing strategies, design layouts, and holding accountability circles.
          </p>
        </section>

        {/* Discord Join Card */}
        <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 p-8 md:p-12 mb-20 relative overflow-hidden backdrop-blur-xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/15 to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl animate-glow-pulse" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="max-w-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 mb-6">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join Our Official Discord</h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Get access to private forums. Connect with like-minded influencers, exchange tips on lighting and editing setups, and gain direct feedback on your post quality and caption styles.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-violet-300">
                <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Vetted creators only</span>
                <span className="flex items-center gap-1">💬 Active growth chat channels</span>
              </div>
            </div>
            <a
              id="discord-join"
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/45 transition-all"
            >
              Join Discord Server <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Events & Calendar */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Community Sessions</h2>
            <div className="space-y-6">
              {events.map((event, idx) => (
                <div key={idx} className="rounded-2xl border border-white/5 bg-[#12121a] p-6 hover:border-violet-500/20 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                    <span className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5" /> {event.date} @ {event.time}
                    </span>
                    <span className="text-xs text-white/40 font-medium">Virtual Workshop</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">{event.description}</p>
                  <p className="text-xs text-white/45 font-medium">Hosted by: <span className="text-white/70">{event.host}</span></p>
                </div>
              ))}
            </div>
          </div>

          {/* Spotlight Card */}
          <div className="rounded-2xl border border-white/5 bg-[#12121a] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Creator Spotlight</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                Each month, we feature a creator who achieved major consistency breakthroughs while taking time away from social media.
              </p>
              <div className="border-t border-white/5 pt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-extrabold text-white text-sm">
                  SZ
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sonia Zheng</h4>
                  <p className="text-xs text-violet-400">@soniaeats · Travel &amp; Food</p>
                </div>
              </div>
            </div>
            <p className="text-xs italic text-white/40 leading-relaxed mt-6">
              &ldquo;GhostFlow allowed me to go on a 2-week backpacking trip with zero service. My feed stayed updated and I didn&apos;t lose any reach.&rdquo;
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
