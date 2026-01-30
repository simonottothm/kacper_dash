"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { TopbarProvider, useTopbar } from "./TopbarProvider";
import type { Membership } from "@/lib/data/tenants";

interface AppShellProps {
  children: ReactNode;
  userEmail: string;
  memberships: Membership[];
  activeTenantId: string | null;
  isAdmin: boolean;
}

function AppShellContent({
  children,
  userEmail,
  memberships,
  activeTenantId,
  isAdmin,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const topbar = useTopbar();

  return (
    <div className="min-h-screen w-full flex bg-[var(--bg)] overflow-hidden" data-app-shell="true">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Width */}
      <Sidebar
        userEmail={userEmail}
        memberships={memberships}
        activeTenantId={activeTenantId}
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area - Takes Remaining Space */}
      <div className="flex-1 min-w-0 w-full flex flex-col overflow-hidden">
        {topbar && (
          <Topbar
            title={topbar.title}
            subtitle={topbar.subtitle}
            backHref={topbar.backHref}
            backLabel={topbar.backLabel}
            actions={topbar.actions}
            tenantId={topbar.tenantId}
            onMenuClick={() => setSidebarOpen(true)}
          />
        )}

        <main className="flex-1 overflow-y-auto min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppShell(props: AppShellProps) {
  return (
    <TopbarProvider config={null}>
      <AppShellContent {...props} />
    </TopbarProvider>
  );
}
