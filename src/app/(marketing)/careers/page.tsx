import { Briefcase, MapPin, DollarSign, Clock, Heart, Award, Zap, Compass } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import ApplyButton from "./apply-button";

export const metadata = {
  title: `Careers — ${APP_NAME}`,
  description: "Help us build the safety net for the creator economy. Explore remote roles in engineering, product, and growth.",
};

const perks = [
  {
    icon: Compass,
    title: "Remote-First Culture",
    description: "Work from anywhere in the world. We operate on high trust and async communication.",
  },
  {
    icon: Heart,
    title: "Mandatory Offline Time",
    description: "We practice what we preach. Unlimited PTO with a mandatory 4 weeks minimum, plus offline weeks.",
  },
  {
    icon: Zap,
    title: "Wellness Stipend",
    description: "$250/month for mental health, gym memberships, massage, or anything that keeps you grounded.",
  },
  {
    icon: Award,
    title: "Professional Growth",
    description: "$2,000 annual budget for conferences, courses, books, or physical workshops.",
  },
];

const jobs = [
  {
    title: "Senior AI NLP Engineer",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    compensation: "$130k – $160k + Equity",
    description: "Optimize our proprietary text-remixing models and activity-pattern prediction systems. Experience with LLM fine-tuning and safety filters is required.",
  },
  {
    title: "Developer Advocate (Creator Ecosystem)",
    department: "Developer Relations",
    location: "Remote (US/Europe)",
    type: "Full-time",
    compensation: "$90k – $115k + Equity",
    description: "Act as the bridge between our API builders and product. Create tutorials, engage with developer-creators, and champion integrations.",
  },
  {
    title: "Senior Full-Stack Product Engineer",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    compensation: "$120k – $150k + Equity",
    description: "Work with React, Next.js, and Node.js to build new automation dashboards, analytics systems, and high-fidelity interactive charts.",
  },
];

export default function CareersPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[30%] left-[-5%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            Careers
          </span>
          <h1 id="careers-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            Join the <span className="gradient-text">Creator Safety Net</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/60 leading-relaxed">
            We are a mission-driven, remote-first team building infrastructure to protect creator health and calendar stability. Help us build the future of sustainable creative businesses.
          </p>
        </section>

        {/* Perks Grid */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Perks of the Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {perks.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div key={idx} className="rounded-2xl border border-white/5 bg-[#12121a] p-6 hover:border-violet-500/20 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{perk.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Culture Statement */}
        <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-violet-950/20 to-cyan-950/20 p-8 md:p-12 mb-24 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-600/10 blur-3xl animate-glow-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">We Live by Creative Freedom</h2>
          <p className="text-white/60 leading-relaxed mb-6 max-w-3xl">
            We build tools that enable people to step away, so we make sure our own team does, too. We do not measure hours, we do not require daily standups, and we actively discourage weekend work. At {APP_NAME}, you are evaluated on outcomes, collaboration, and trust.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-violet-400">
            <span className="rounded-full bg-white/5 border border-white/5 px-3 py-1">🌎 100% Distributed</span>
            <span className="rounded-full bg-white/5 border border-white/5 px-3 py-1">💬 Async-first</span>
            <span className="rounded-full bg-white/5 border border-white/5 px-3 py-1">🌴 4-Day Work Weeks in Summer</span>
          </div>
        </section>

        {/* Open Positions */}
        <section>
          <h2 className="text-3xl font-bold text-center text-white mb-12">Open Opportunities</h2>
          <div className="flex flex-col gap-6">
            {jobs.map((job, idx) => (
              <div key={idx} className="group relative rounded-2xl border border-white/5 bg-[#12121a] p-6 md:p-8 hover:border-violet-500/20 transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.type}</span>
                      <span className="flex items-center gap-1 text-violet-400"><DollarSign className="h-3 w-3" /> {job.compensation}</span>
                    </div>
                  </div>
                  <ApplyButton jobTitle={job.title} idx={idx} />
                </div>
                <p className="text-sm text-white/50 leading-relaxed md:max-w-4xl">
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
