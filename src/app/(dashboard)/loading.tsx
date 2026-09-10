export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-foreground/8" />
          <div className="h-4 w-72 rounded-lg bg-foreground/8" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-foreground/8" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-foreground/[0.02] p-5 space-y-3">
            <div className="h-4 w-16 rounded-md bg-foreground/8" />
            <div className="h-8 w-12 rounded-md bg-foreground/8" />
            <div className="h-3 w-20 rounded-md bg-foreground/8" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-foreground/[0.02] p-5 space-y-4 h-64">
          <div className="h-5 w-32 rounded-md bg-foreground/8" />
          <div className="h-40 w-full rounded-lg bg-foreground/8" />
        </div>
        <div className="rounded-xl border border-border bg-foreground/[0.02] p-5 space-y-4 h-64">
          <div className="h-5 w-24 rounded-md bg-foreground/8" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-foreground/8 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded-md bg-foreground/8" />
                  <div className="h-2.5 w-1/2 rounded-md bg-foreground/8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
