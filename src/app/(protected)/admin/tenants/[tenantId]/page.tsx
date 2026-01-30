import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import { getTenantById, verifyTenantAdmin } from "@/lib/data/adminTenants";
import { listTenantCampaigns } from "@/lib/data/adminCampaigns";
import { listTenantStatuses } from "@/lib/data/adminStatus";
import { listTenantTemplates } from "@/lib/data/adminTemplates";
import { listTenantCustomFields } from "@/lib/data/adminCustomFields";
import { listTenantInvites } from "@/lib/data/adminInvites";
import { listTenantApiKeys } from "@/lib/data/apiKeys";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import TenantTabs from "@/components/admin/TenantTabs";

interface TenantDetailPageProps {
  params: Promise<{ tenantId: string }>;
}

export default async function TenantDetailPage({ params }: TenantDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { tenantId } = await params;
  const isTenantAdmin = await verifyTenantAdmin(tenantId);

  if (!isTenantAdmin) {
    redirect("/app");
  }

  const tenant = await getTenantById(tenantId);

  if (!tenant) {
    redirect("/admin");
  }

  const activeTenantId = await getActiveTenantId(user.id);
  const memberships = await getMemberships(user.id);
  const isAdmin = memberships.some((m) => m.role === "admin");

  const [campaigns, statuses, templates, customFields, invites, apiKeys] = await Promise.all([
    listTenantCampaigns(tenantId),
    listTenantStatuses(tenantId),
    listTenantTemplates(tenantId),
    listTenantCustomFields(tenantId),
    listTenantInvites(tenantId),
    listTenantApiKeys(tenantId),
  ]);

  return (
    <TopbarProvider
      config={{
        title: tenant.name,
        subtitle: "Tenant Configuration",
        backHref: "/admin",
        backLabel: "Admin",
      }}
    >
      <div className="px-6 sm:px-8 py-6 w-full">
        <div className="bg-card border border-app rounded-2xl shadow-app overflow-hidden">
          <TenantTabs
            tenantId={tenantId}
            campaigns={campaigns}
            statuses={statuses}
            templates={templates}
            customFields={customFields}
            invites={invites}
            apiKeys={apiKeys}
          />
        </div>
      </div>
    </TopbarProvider>
  );
}
