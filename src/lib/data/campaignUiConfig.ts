import { createClient } from "@/lib/supabase/server";
import type { CampaignColumnConfig } from "@/lib/config/campaignColumns";

export interface CampaignUiConfig {
  campaign_id: string;
  tenant_id: string;
  columns: CampaignColumnConfig[];
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

