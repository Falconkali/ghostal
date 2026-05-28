import { Key, Code2, Server, Terminal, Lock } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `API Reference — ${APP_NAME}`,
  description: "Developer API documentation for GhostFlow. Connect programmatic workflows, upload vault media, and track momentum scores.",
};

const endpoints = [
  {
    method: "POST",
    path: "/v1/vault/upload",
    description: "Upload reels, image assets, or captions to your vault programmatically.",
    requestBody: `{
  "media_url": "https://storage.yoursite.com/reels/vid_9281.mp4",
  "media_type": "VIDEO",
  "default_caption": "Life updates from the road 📸",
  "tags": ["travel", "bts"]
}`,
    response: `{
  "id": "vlt_87f191b9",
  "status": "PROCESSED",
  "media_url": "https://cdn.ghostflow.ai/vlt_87f191b9.mp4",
  "created_at": "2026-05-25T10:00:00Z"
}`,
  },
  {
    method: "GET",
    path: "/v1/momentum/health",
    description: "Query consistency score, active alerts, queue risk thresholds, and days remaining.",
    requestBody: `None (Requires Auth Header)`,
    response: `{
  "consistency_score": 96.4,
  "queue_health": "OPTIMAL",
  "days_remaining": 14.5,
  "inactivity_detected": false,
  "ghost_mode_active": false
}`,
  },
  {
    method: "POST",
    path: "/v1/survival/trigger",
    description: "Force trigger survival posting mode instantly (useful for unexpected emergencies).",
    requestBody: `{
  "reason": "FLIGHT_DELAYED",
  "duration_hours": 24
}`,
    response: `{
  "session_id": "srv_19b882da",
  "ghost_mode_active": true,
  "scheduled_posts": 2,
  "triggered_at": "2026-05-25T10:05:00Z"
}`,
  },
];

export default function ApiDocsPage() {
  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-4">
            Developer API
          </span>
          <h1 id="api-title" className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            API <span className="gradient-text">Reference</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Automate your vaults and query momentum vitals using our developer API. Standard REST architecture.
          </p>
        </section>

        {/* Global Config Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Authentication</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Provide your API secret key as a Bearer token in the Authorization header of all outgoing requests.
            </p>
            <pre className="text-xs text-white/70 font-mono bg-[#09090f] p-3.5 rounded-lg overflow-x-auto">
Authorization: Bearer gf_live_...
            </pre>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#12121a] p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 mb-4">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Base URL</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              All requests must be made over HTTPS. HTTP requests will be redirected to secure connections automatically.
            </p>
            <pre className="text-xs text-white/70 font-mono bg-[#09090f] p-3.5 rounded-lg overflow-x-auto">
https://api.ghostflow.ai/v1
            </pre>
          </div>
        </section>

        {/* Endpoint List */}
        <section className="space-y-12">
          <h2 className="text-2xl font-bold text-white border-b border-white/5 pb-4">Endpoints</h2>
          {endpoints.map((ep, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start border-b border-white/5 pb-12 last:border-b-0">
              {/* Left Column: Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-md text-xs font-extrabold ${
                    ep.method === "POST" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15" : "bg-violet-500/10 text-violet-400 border border-violet-500/15"
                  }`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm text-white/80 font-bold">{ep.path}</span>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  {ep.description}
                </p>
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Request Body</h4>
                  <pre className="text-xs text-white/60 font-mono bg-[#12121a] p-4 rounded-xl overflow-x-auto border border-white/5">
                    {ep.requestBody}
                  </pre>
                </div>
              </div>

              {/* Right Column: Code Snippet Response */}
              <div>
                <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-violet-400" /> Response (JSON 200 OK)
                </h4>
                <pre className="text-xs text-white/70 font-mono bg-[#09090f] p-4 rounded-xl overflow-x-auto border border-white/5">
                  {ep.response}
                </pre>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
