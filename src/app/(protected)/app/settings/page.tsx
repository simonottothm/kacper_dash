import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getTenantById } from "@/lib/data/tenants";
import { getMemberships } from "@/lib/data/tenants";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import NotificationSettings from "@/components/notifications/NotificationSettings";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const activeTenantId = await getActiveTenantId(user.id);

  if (!activeTenantId) {
    redirect("/app");
  }

  const tenant = await getTenantById(activeTenantId);
  const memberships = await getMemberships(user.id);
  const isAdmin = memberships.some((m) => m.role === "admin");

  return (
    <TopbarProvider
      config={{
        title: "Settings",
        subtitle: tenant?.name,
        backHref: "/app",
        backLabel: "Dashboard",
        tenantId: activeTenantId,
      }}
    >
      <div className="px-6 sm:px-8 py-6 w-full">
        <div className="max-w-2xl">
          <div className="bg-card border border-app rounded-2xl shadow-app p-6">
            <NotificationSettings tenantId={activeTenantId} />
          </div>
        </div>
      </div>
    </TopbarProvider>
  );
}
