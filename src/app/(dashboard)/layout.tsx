"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Topbar from "@/components/dashboard/topbar";
import AutomationRunner from "@/components/dashboard/automation-runner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSettings = pathname?.startsWith("/settings");

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = "/login";
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Validating session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Full-page focused layout for Settings (Option 2: No main sidebar or topbar distraction)
  if (isSettings) {
    return (
      <div className="min-h-screen bg-background">
        <AutomationRunner />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AutomationRunner />
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <Topbar
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <main
        className={cn(
          "pt-16 min-h-screen",
          sidebarCollapsed ? "md-ml-sidebar-sm" : "md-ml-sidebar"
        )}
      >
        <div className="p-4 md:p-5 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

