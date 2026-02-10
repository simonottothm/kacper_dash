import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import { getCampaignById, verifyCampaignAccess } from "@/lib/data/campaigns";
import { getTenantById } from "@/lib/data/tenants";
import { listLeads, listStatusesForTenant, listLeadsByStatus } from "@/lib/data/leads";
import { parseLeadQueryParams } from "@/lib/utils/queryParams";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import LeadTableToolbar from "@/components/leads/LeadTableToolbar";
import LeadTable from "@/components/leads/LeadTable";
import ViewToggle from "@/components/campaigns/ViewToggle";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { listTenantCustomFields } from "@/lib/data/adminCustomFields";
import { getDefaultCampaignColumns } from "@/lib/config/campaignColumns";
import { getCampaignUiConfig } from "@/lib/data/campaignUiConfig";
import CreateLeadButton from "@/components/leads/CreateLeadButton";
import Link from "next/link";

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CampaignPage({ params, searchParams }: CampaignPageProps) {
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

  const allMemberships = await getMemberships(user.id);
  const activeMembership = allMemberships.find((m) => m.tenant_id === activeTenantId);

  if (!activeMembership) {
    redirect("/app");
  }

  const hasAccess = await verifyCampaignAccess(
    campaignId,
    user.id,
    activeMembership.role
  );

  if (!hasAccess) {
    redirect("/app");
  }

  const tenant = await getTenantById(activeTenantId);

  const resolvedSearchParams = await searchParams;
  const view = (resolvedSearchParams.view as "table" | "kanban" | undefined) || "table";
  const leadId = resolvedSearchParams.leadId as string | undefined;

  const queryParams = parseLeadQueryParams(
    new URLSearchParams(
      Object.entries(resolvedSearchParams).reduce(
        (acc, [key, value]) => {
          if (value && key !== "view" && key !== "leadId") {
            acc[key] = Array.isArray(value) ? value[0] : value;
          }
          return acc;
        },
        {} as Record<string, string>
      )
    )
  );

  const page = queryParams.page || 1;
  const pageSize = 20;

  const [statuses, customFields, uiConfig] = await Promise.all([
    listStatusesForTenant(activeTenantId),
    listTenantCustomFields(activeTenantId),
    getCampaignUiConfig(campaignId),
  ]);

  let leadsResult;
  let kanbanLeads: Array<{ statusId: string | null; leads: Awaited<ReturnType<typeof listLeadsByStatus>> }> = [];

  if (view === "kanban") {
    const statusIds = statuses.map((s) => s.id);

    const allStatusLeads = await Promise.all([
      ...statusIds.map(async (statusId) => ({
        statusId,
        leads: await listLeadsByStatus(campaignId, statusId),
      })),
      {
        statusId: null,
        leads: await listLeadsByStatus(campaignId, null),
      },
    ]);

    kanbanLeads = allStatusLeads;
    leadsResult = {
      rows: allStatusLeads.flatMap((s) => s.leads).slice(0, 100),
      total: allStatusLeads.reduce((sum, s) => sum + s.leads.length, 0),
    };
  } else {
    leadsResult = await listLeads({
      campaignId,
      q: queryParams.q,
      statusId: queryParams.status,
      followup: queryParams.followup || undefined,
      sort: queryParams.sort || "updated_desc",
      page,
      pageSize,
    });
  }

  return (
    <TopbarProvider
      config={{
        title: campaign.name,
        subtitle: tenant?.name,
        backHref: "/app",
        backLabel: "Dashboard",
        tenantId: activeTenantId || undefined,
      }}
    >
      <div className="px-6 sm:px-8 py-6 w-full">
        <div className="w-full">
          <div className="min-w-0">
            <div className="bg-card border border-app rounded-2xl shadow-app overflow-hidden">
              <div className="px-6 py-4 border-b border-app flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text)]">Leads</h2>
                <div className="flex items-center gap-3">
                  {activeMembership.role === "admin" && (
                    <Link
                      href={`/app/campaigns/${campaignId}/settings`}
                      className="px-3 py-2 border border-app rounded-xl text-sm font-medium text-[var(--text)] bg-card hover:bg-[var(--bg)] transition-colors"
                    >
                      Kampagneneinstellungen
                    </Link>
                  )}
                  <CreateLeadButton
                    campaignId={campaignId}
                    statuses={statuses}
                    customFields={customFields}
                  />
                  <ViewToggle currentView={view} />
                </div>
              </div>

              <div className="p-6">
                {view === "kanban" ? (
                  <KanbanBoard
                    campaignId={campaignId}
                    statuses={statuses}
                    initialLeads={kanbanLeads.flatMap((s) => s.leads)}
                  />
                ) : (
                  <>
                    <LeadTableToolbar statuses={statuses} />
                    <div className="mt-4">
                      <LeadTable
                        leads={leadsResult.rows}
                        total={leadsResult.total}
                        currentPage={page}
                        pageSize={pageSize}
                        campaignId={campaignId}
                        statuses={statuses}
                        initialLeadId={leadId}
                        columns={uiConfig?.columns?.length ? uiConfig.columns : getDefaultCampaignColumns()}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TopbarProvider>
  );
}
