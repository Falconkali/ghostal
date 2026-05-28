import { Heart, Users, Sparkles, Shield, Compass } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `About Us — ${APP_NAME}`,
  description: "Learn about the mission, values, and team behind the ultimate creator continuity system.",
};

const stats = [
  { label: "Active Creators", value: "15,000+" },
  { label: "Posts Automated", value: "2.4M" },
  { label: "Momentum Preserved", value: "98.4%" },
  { label: "Downtime Prevented", value: "450K hrs" },
];

const values = [
  {
    icon: Compass,
    title: "Autonomy First",
    description: "We give creators their lives back. Step away for an hour, a day, or a month, knowing your audience is still cared for.",
  },
  {
    icon: Shield,
    title: "Consistency Protection",
    description: "Inconsistent publication frequency can reduce content reach. We act as your safety net, keeping your queue active during offline periods.",
  },
  {
    icon: Sparkles,
    title: "Creative Integrity",
    description: "Our AI helps you refine and repurpose your actual caption history. We help preserve your voice while generating content variations.",
  },
];

const team = [
  {
    name: "Alex Sterling",
    role: "Co-Founder & CEO",
    bio: "Ex-Instagram growth engineer. Built GhostFlow after experiencing severe creator burnout first-hand.",
    avatar: "AS",
  },
  {
    name: "Dr. Livia Chen",
    role: "Chief AI Architect",
    bio: "Ph.D. in NLP. Architect of our proprietary caption-remix and activity detection models.",
    avatar: "LC",
  },
  {
    name: "Marcus Vane",
    role: "Head of Creator Relations",
    bio: "Former lifestyle vlogger with 500k+ followers. Passionate about mental health in the creator economy.",
    avatar: "MV",
  },
];

export default function AboutPage() {
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
        <section className="text-center mb-20">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            Our Story
          </span>
          <h1 id="about-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            Built For <span className="gradient-text">Creator Longevity</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/60 leading-relaxed">
            The creator economy is built on a lie: that you must publish constantly, without rest, or be forgotten. We started {APP_NAME} to shatter that expectation.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4 gap-y-8 mb-24 border border-white/5 bg-[#12121a]/50 rounded-2xl p-8 backdrop-blur-xl">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl mb-2">{stat.value}</p>
              <p className="text-sm font-medium text-white/50">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Mission Statement */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Consistency shouldn&apos;t come at the cost of your mental health, your relationships, or your life. We believe creators deserve the same benefits as other workers: the right to take a vacation, get sick, or simply go offline for a weekend.
            </p>
            <p className="text-white/60 leading-relaxed">
              By building a safety net that protects your digital momentum automatically, {APP_NAME} ensures your business continues to thrive even when you step away.
            </p>
          </div>
          <div className="relative rounded-2xl border border-white/5 bg-[#12121a] p-8 overflow-hidden group">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl transition-opacity group-hover:bg-violet-600/20" />
            <Heart className="h-10 w-10 text-violet-400 mb-6" />
            <blockquote className="text-lg font-medium text-white italic mb-4">
              &ldquo;The future belongs to creators who play the long game. Burnout isn&apos;t a badge of honor; longevity is.&rdquo;
            </blockquote>
            <cite className="text-sm font-semibold text-white/50">— The {APP_NAME} Manifesto</cite>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center text-white mb-12">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="rounded-2xl border border-white/5 bg-[#12121a] p-6 transition-all hover:border-violet-500/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-bold text-center text-white mb-12">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="rounded-2xl border border-white/5 bg-[#12121a] p-6 text-center transition-all hover:shadow-2xl hover:shadow-violet-500/5 group">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-extrabold text-white mb-6 shadow-lg group-hover:scale-105 transition-transform">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-violet-400 mb-4">{member.role}</p>
                <p className="text-sm text-white/60 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
