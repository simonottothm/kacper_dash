import { createClient } from "@/lib/supabase/server";

export interface CampaignColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

export interface CampaignUiConfig {
  campaign_id: string;
  tenant_id: string;
  columns: CampaignColumnConfig[];
}

export const DEFAULT_CAMPAIGN_COLUMNS: CampaignColumnConfig[] = [
  { key: "full_name", label: "Name", visible: true, order: 1 },
  { key: "company", label: "Company", visible: true, order: 2 },
  { key: "email", label: "Email", visible: true, order: 3 },
  { key: "phone", label: "Phone", visible: true, order: 4 },
  { key: "status", label: "Status", visible: true, order: 5 },
  { key: "next_follow_up_at", label: "Follow-up", visible: true, order: 6 },
  { key: "updated_at", label: "Updated", visible: true, order: 7 },
];

export function getDefaultCampaignColumns(): CampaignColumnConfig[] {
  return DEFAULT_CAMPAIGN_COLUMNS.map((col) => ({ ...col }));
}

export async function getCampaignUiConfig(
  campaignId: string
): Promise<CampaignUiConfig | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_ui_config")
    .select("campaign_id, tenant_id, columns")
    .eq("campaign_id", campaignId)
    .single();

  if (error || !data) {
    return null;
  }

  const columns = Array.isArray(data.columns) ? (data.columns as CampaignColumnConfig[]) : [];

  return {
    campaign_id: data.campaign_id,
    tenant_id: data.tenant_id,
    columns,
  };
}

export async function upsertCampaignUiConfig(
  campaignId: string,
  tenantId: string,
  columns: CampaignColumnConfig[]
): Promise<CampaignUiConfig> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_ui_config")
    .upsert(
      {
        campaign_id: campaignId,
        tenant_id: tenantId,
        columns,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "campaign_id" }
    )
    .select("campaign_id, tenant_id, columns")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to update campaign UI config");
  }

  return {
    campaign_id: data.campaign_id,
    tenant_id: data.tenant_id,
    columns: (data.columns || []) as CampaignColumnConfig[],
  };
}

