import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { resolveActiveTenant } from "@/lib/tenant/activeTenant";
import { getCampaigns } from "@/lib/data/campaigns";
import { getTenantById } from "@/lib/data/tenants";
import { getMemberships } from "@/lib/data/tenants";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import Link from "next/link";

export default async function AppPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { activeTenantId, memberships, shouldSetCookie } = await resolveActiveTenant(user.id);

  if (shouldSetCookie && activeTenantId) {
    redirect(`/api/tenant/active?tenantId=${activeTenantId}&redirect=/app`);
  }

  const allMemberships = await getMemberships(user.id);
  const isAdmin = allMemberships.some((m) => m.role === "admin");

  if (memberships.length === 0) {
    return (
      <TopbarProvider
        config={{
          title: "Dashboard",
        }}
      >
        <div className="px-6 sm:px-8 py-6 w-full">
          <div className="bg-card border border-app rounded-2xl shadow-app p-12 text-center">
            <p className="text-muted">
              Kein Zugriff. Bitte kontaktieren Sie einen Administrator, um zu einem Mandanten hinzugefügt zu werden.
            </p>
          </div>
        </div>
      </TopbarProvider>
    );
  }

  if (!activeTenantId) {
    return (
      <TopbarProvider
        config={{
          title: "Dashboard",
        }}
      >
        <div className="px-6 sm:px-8 py-6 w-full">
          <div className="bg-card border border-app rounded-2xl shadow-app p-12 text-center">
            <p className="text-muted">Bitte wählen Sie einen Mandanten aus, um fortzufahren.</p>
          </div>
        </div>
      </TopbarProvider>
    );
  }

  const activeMembership = memberships.find((m) => m.tenant_id === activeTenantId);
  const tenant = await getTenantById(activeTenantId);
  const campaigns = await getCampaigns(
    activeTenantId,
    user.id,
    activeMembership?.role || "client"
  );

  return (
    <TopbarProvider
      config={{
        title: "Dashboard",
        subtitle: tenant?.name,
        tenantId: activeTenantId,
      }}
    >
      <div className="px-6 sm:px-8 py-6 w-full">
        <div className="w-full">
          {/* Main Column - Full Width */}
          <div className="min-w-0 space-y-6">
            {/* Welcome Card */}
            <div className="bg-accent-gradient rounded-2xl p-8 text-white shadow-app-lg">
              <h1 className="text-2xl font-semibold mb-2">Willkommen zurück!</h1>
              <p className="text-blue-100 text-base">
                {tenant?.name ? `Kampagnen verwalten für ${tenant.name}` : "Verwalten Sie Ihre Leads und Kampagnen"}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-app rounded-2xl p-6 shadow-app hover:shadow-app-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted">Kampagnen gesamt</span>
                  <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-[var(--text)]">{campaigns.length}</div>
              </div>

              <div className="bg-card border border-app rounded-2xl p-6 shadow-app hover:shadow-app-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted">Aktiver Mandant</span>
                  <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="text-lg font-semibold text-[var(--text)] truncate">{tenant?.name || "—"}</div>
              </div>

              <div className="bg-card border border-app rounded-2xl p-6 shadow-app hover:shadow-app-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted">Ihre Rolle</span>
                  <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-lg font-semibold text-accent capitalize">{activeMembership?.role || "client"}</div>
              </div>
            </div>

            {/* Campaigns Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text)]">Kampagnen</h2>
                {campaigns.length > 0 && (
                  <span className="text-sm text-muted">{campaigns.length} {campaigns.length === 1 ? 'Kampagne' : 'Kampagnen'}</span>
                )}
              </div>

              {campaigns.length === 0 ? (
                <div className="bg-card border border-app rounded-2xl shadow-app p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-[var(--text)] mb-1">Noch keine Kampagnen verfügbar</p>
                  <p className="text-sm text-muted">Erstellen Sie Ihre erste Kampagne, um zu beginnen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/app/campaigns/${campaign.id}`}
                      className="group block p-5 bg-card border border-app rounded-2xl shadow-app hover:shadow-app-md hover:border-accent/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-[var(--text)] mb-1.5 group-hover:text-accent transition-colors duration-200">
                            {campaign.name}
                          </h3>
                          {campaign.description && (
                            <p className="text-sm text-muted line-clamp-2">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TopbarProvider>
  );
}
