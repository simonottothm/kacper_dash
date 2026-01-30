import { createClient } from "@/lib/supabase/server";

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export async function listTenantCampaigns(tenantId: string): Promise<Campaign[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch campaigns: ${error.message}`);
  }

  return (data || []) as Campaign[];
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error) {
    return null;
  }

  return data as Campaign;
}

export async function createCampaign(
  tenantId: string,
  name: string,
  description: string | null
): Promise<Campaign> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      tenant_id: tenantId,
      name,
      description,
      is_archived: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }

  return data as Campaign;
}

export async function updateCampaign(
  campaignId: string,
  updates: { name?: string; description?: string | null; is_archived?: boolean }
): Promise<Campaign> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update campaign: ${error.message}`);
  }

  return data as Campaign;
}

