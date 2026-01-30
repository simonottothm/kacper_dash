import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import { getCampaignById, verifyCampaignAccess } from "@/lib/data/campaigns";
import { listTenantCustomFields } from "@/lib/data/adminCustomFields";
import {
  getCampaignUiConfig,
  getDefaultCampaignColumns,
} from "@/lib/data/campaignUiConfig";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import CampaignSettingsTabs from "@/components/campaigns/CampaignSettingsTabs";

interface CampaignSettingsPageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignSettingsPage({ params }: CampaignSettingsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { campaignId } = await params;
  const campaign = await getCampaignById(campaignId);
  if (!campaign) {
    redirect("/app");
  }

  const activeTenantId = await getActiveTenantId(user.id);
  if (!activeTenantId) {
    redirect("/app");
  }

  const memberships = await getMemberships(user.id);
  const membership = memberships.find((m) => m.tenant_id === activeTenantId);
  if (!membership) {
    redirect("/app");
  }

  const hasAccess = await verifyCampaignAccess(campaignId, user.id, membership.role);
  if (!hasAccess) {
    redirect("/app");
  }

  const [customFields, uiConfig] = await Promise.all([
    listTenantCustomFields(activeTenantId),
    getCampaignUiConfig(campaignId),
  ]);

  const columns = uiConfig?.columns?.length ? uiConfig.columns : getDefaultCampaignColumns();

  return (
    <TopbarProvider
      config={{
        title: "Campaign Settings",
        subtitle: campaign.name,
        backHref: `/app/campaigns/${campaignId}`,
        backLabel: "Campaign",
        tenantId: activeTenantId,
      }}
    >
      <div className="px-6 sm:px-8 py-6 w-full">
        <CampaignSettingsTabs
          campaignId={campaignId}
          tenantId={activeTenantId}
          columns={columns}
          customFields={customFields}
        />
      </div>
    </TopbarProvider>
  );
}

