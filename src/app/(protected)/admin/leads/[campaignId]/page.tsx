import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getMemberships } from "@/lib/data/tenants";
import { createClient } from "@/lib/supabase/server";
import { listLeads, listStatusesForTenant } from "@/lib/data/leads";
import { parseLeadQueryParams } from "@/lib/utils/queryParams";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import LeadTableToolbar from "@/components/leads/LeadTableToolbar";
import LeadTable from "@/components/leads/LeadTable";
import CreateLeadButton from "@/components/leads/CreateLeadButton";
import { getDefaultCampaignColumns } from "@/lib/config/campaignColumns";

interface AdminCampaignPageProps {
    params: Promise<{ campaignId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminCampaignPage({ params, searchParams }: AdminCampaignPageProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const memberships = await getMemberships(user.id);
    const isAdmin = memberships.some((m) => m.role === "admin");

    if (!isAdmin) {
        redirect("/app");
    }

    const { campaignId } = await params;
    const supabase = await createClient();

    // Get campaign (must be admin-owned)
    const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .is("tenant_id", null)
        .eq("created_by", user.id)
        .single();

    if (campaignError || !campaign) {
        redirect("/admin/leads");
    }

    const resolvedSearchParams = await searchParams;
    const leadId = resolvedSearchParams.leadId as string | undefined;

    const queryParams = parseLeadQueryParams(
        new URLSearchParams(
            Object.entries(resolvedSearchParams).reduce(
                (acc, [key, value]) => {
                    if (value && key !== "leadId") {
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

    // Get global statuses (not tenant-specific for admin campaigns)
    const statuses: any[] = [];

    const leadsResult = await listLeads({
        campaignId,
        q: queryParams.q,
        statusId: queryParams.status,
        followup: queryParams.followup || undefined,
        sort: queryParams.sort || "updated_desc",
        page,
        pageSize,
    });

    return (
        <TopbarProvider
            config={{
                title: campaign.name,
                backHref: "/admin/leads",
                backLabel: "Eigene Leads",
            }}
        >
            <div className="px-6 sm:px-8 py-6 w-full">
                <div className="w-full">
                    <div className="min-w-0">
                        <div className="bg-card border border-app rounded-2xl shadow-app overflow-hidden">
                            <div className="px-6 py-4 border-b border-app flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-[var(--text)]">Leads</h2>
                                <div className="flex items-center gap-3">
                                    <CreateLeadButton
                                        campaignId={campaignId}
                                        statuses={statuses}
                                        customFields={[]}
                                    />
                                </div>
                            </div>

                            <div className="p-6">
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
                                        columns={getDefaultCampaignColumns()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TopbarProvider>
    );
}
