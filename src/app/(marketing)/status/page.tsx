import { CheckCircle2, Clock, ShieldCheck, RefreshCw, BarChart2 } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `System Status — ${APP_NAME}`,
  description: "Check the current operational status of GhostFlow's services, API gateways, storage grids, and NLP remixing models.",
};

const systems = [
  { name: "API Gateway", status: "Operational", uptime: "99.98%" },
  { name: "Automation Scheduler", status: "Operational", uptime: "100.00%" },
  { name: "Caption Remixing Engine", status: "Operational", uptime: "99.95%" },
  { name: "Content Vault Storage", status: "Operational", uptime: "100.00%" },
  { name: "Inactivity Monitor Engine", status: "Operational", uptime: "99.99%" },
];

export default function StatusPage() {
  // Generate mock grid points (e.g. 30 days)
  const days = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Main Status Header */}
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 mb-16 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
          <CheckCircle2 className="h-14 w-14 text-emerald-400 shrink-0" />
          <div className="text-center sm:text-left">
            <h1 id="status-title" className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              All Systems Operational
            </h1>
            <p className="text-sm text-white/60">
              GhostFlow systems are fully active and scheduling normally. No disruptions detected.
            </p>
          </div>
          <span className="sm:ml-auto text-xs text-white/35 flex items-center gap-1.5 font-medium">
            <RefreshCw className="h-3 w-3 animate-spin" /> Live Updates
          </span>
        </section>

        {/* Services List */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Service Health</h2>
          <div className="rounded-2xl border border-white/5 bg-[#12121a] divide-y divide-white/5 overflow-hidden">
            {systems.map((sys, idx) => (
              <div key={idx} className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-bold text-white text-base">{sys.name}</h3>
                  <span className="text-xs text-white/40 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> {sys.uptime} uptime (past 30 days)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-md">
                    {sys.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Uptime History Graph Grid */}
        <section className="mb-16 border border-white/5 bg-[#12121a]/50 p-6 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-violet-400" /> API Uptime History
            </h3>
            <span className="text-xs text-white/40">Past 30 Days</span>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-30 gap-2 mb-4">
            {days.map((day) => (
              <div
                key={day}
                className="aspect-square rounded bg-emerald-500 hover:brightness-110 transition-all cursor-pointer relative group"
                title={`Day -${30 - day}: 100% Uptime`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black border border-white/10 text-[10px] text-white px-2 py-1 rounded whitespace-nowrap z-20">
                  Day {day + 1}: 100% Uptime
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-white/40 border-t border-white/5 pt-4">
            <span>30 Days Ago</span>
            <span className="text-emerald-400 font-medium">99.98% Average</span>
            <span>Today</span>
          </div>
        </section>

        {/* Past Incidents */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Past Incidents</h2>
          <div className="rounded-2xl border border-white/5 bg-[#12121a]/30 p-8 text-center text-white/40">
            <ShieldCheck className="mx-auto h-10 w-10 text-white/20 mb-4" />
            No incidents reported in the last 90 days.
          </div>
        </section>
      </div>
    </div>
  );
}
