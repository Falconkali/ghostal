import RadialOrbitalTimeline from "@/components/radial-orbital-timeline";

export const metadata = {
  title: "Timeline | Ghostal",
  description: "Ghostal Development Timeline",
};

export default function OrbitalPage() {
  return (
    <main className="min-h-screen bg-black">
      <RadialOrbitalTimeline />
    </main>
  );
}
