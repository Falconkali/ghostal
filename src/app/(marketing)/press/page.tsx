import { Download, Mail, Copy, Image, FileText, Layout } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Press Kit — ${APP_NAME}`,
  description: "Download official brand assets, logos, screenshots, and find media contact details for press coverage.",
};

const colors = [
  { name: "Deep Space (Background)", hex: "#09090F" },
  { name: "Ghost Violet (Primary)", hex: "#8B5CF6" },
  { name: "Ghost Cyan (Accent)", hex: "#06B6D4" },
  { name: "Off-White (Text)", hex: "#EAEAF0" },
];

const releases = [
  {
    title: "GhostFlow Announces $4.5M Seed Round to Solve Creator Burnout",
    date: "April 21, 2026",
    link: "#",
    excerpt: "Funding led by Horizon Ventures will accelerate developer hiring and research into offline continuity models.",
  },
  {
    title: "GhostFlow Launches the Creator Health Initiative to Foster Sustainable Social Growth",
    date: "March 15, 2026",
    link: "#",
    excerpt: "New pledge offers mental health stipends and educational guides to full-time creators taking extended offline breaks.",
  },
];

export default function PressKitPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[15%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            Media Assets
          </span>
          <h1 id="press-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            Press Kit &amp; <span className="gradient-text">Brand Assets</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/60 leading-relaxed">
            Official logos, screenshots, brand assets, and press releases. If you are writing about {APP_NAME}, you are in the right place.
          </p>
        </section>

        {/* Brand Assets Cards */}
        <section className="mb-24">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Brand Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logos */}
            <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 flex flex-col justify-between group hover:border-violet-500/20 transition-all">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 mb-6">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Official Logos</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-6">
                  Includes PNG, SVG, dark and light mode logo files and standard social icons.
                </p>
              </div>
              <button
                id="dl-logos"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
              >
                <Download className="h-4 w-4" /> Download Logo Pack (.zip)
              </button>
            </div>

            {/* Screenshots */}
            <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 flex flex-col justify-between group hover:border-violet-500/20 transition-all">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-6">
                  <Image className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Product Screenshots</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-6">
                  High-res desktop and mobile dashboard, analytics, and content-remix layouts.
                </p>
              </div>
              <button
                id="dl-screens"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
              >
                <Download className="h-4 w-4" /> Download Screen Pack (.zip)
              </button>
            </div>

            {/* Fact Sheet */}
            <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6 flex flex-col justify-between group hover:border-violet-500/20 transition-all">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Company Fact Sheet</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-6">
                  PDF containing company overview, key statistics, founders&apos; biographies, and details.
                </p>
              </div>
              <button
                id="dl-facts"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
              >
                <Download className="h-4 w-4" /> Download Fact Sheet (.pdf)
              </button>
            </div>
          </div>
        </section>

        {/* Brand Colors */}
        <section className="mb-24 border border-white/5 bg-[#12121a]/50 p-8 rounded-2xl backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Official Colors</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {colors.map((color, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-lg border border-white/15"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <p className="text-xs text-white/55 font-medium">{color.name}</p>
                  <p className="text-sm text-white font-mono flex items-center gap-1.5 mt-0.5">
                    {color.hex}
                    <button
                      id={`copy-color-${idx}`}
                      className="text-white/40 hover:text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* News Releases & Media Contact */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Releases */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-8">Latest Press Releases</h2>
            <div className="flex flex-col gap-6">
              {releases.map((release, idx) => (
                <div key={idx} className="border-l-2 border-violet-500 pl-6 py-1">
                  <span className="text-xs text-white/40 font-medium">{release.date}</span>
                  <h3 className="text-lg font-bold text-white hover:text-violet-300 transition-colors mt-1 mb-2">
                    <a href={release.link}>{release.title}</a>
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {release.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Card */}
          <div className="rounded-2xl border border-white/5 bg-[#12121a] p-8 flex flex-col justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 mb-6">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Media Relations</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              For interviews, review access requests, or other media inquiries, contact us at:
            </p>
            <a
              id="press-email"
              href="mailto:press@ghostflow.ai"
              className="text-lg font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              press@ghostflow.ai
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
