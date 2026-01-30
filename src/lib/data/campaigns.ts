import { createClient } from "@/lib/supabase/server";
import { USE_CAMPAIGN_ASSIGNMENTS } from "@/lib/config";

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
}

export async function getCampaigns(
  tenantId: string,
  userId: string,
  userRole: "admin" | "client",
  includeArchived = false
): Promise<Campaign[]> {
  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select("id, tenant_id, name, description, is_archived")
    .eq("tenant_id", tenantId);

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  if (userRole === "admin") {
    const { data, error } = await query.order("name");

    if (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return data || [];
  }

  if (USE_CAMPAIGN_ASSIGNMENTS) {
    const { data: assignedCampaigns, error: assignmentError } = await supabase
      .from("campaign_users")
      .select("campaign_id")
      .eq("user_id", userId);

    if (assignmentError) {
      throw new Error(`Failed to fetch campaign assignments: ${assignmentError.message}`);
    }

    const assignedIds = (assignedCampaigns || []).map((item) => item.campaign_id);

    if (assignedIds.length === 0) {
      return [];
    }

    const { data, error } = await query.in("id", assignedIds).order("name");

    if (error) {
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    return data || [];
  }

  const { data, error } = await query.order("name");

  if (error) {
    throw new Error(`Failed to fetch campaigns: ${error.message}`);
  }

  return data || [];
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select("id, tenant_id, name, description, is_archived")
    .eq("id", campaignId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function verifyCampaignAccess(
  campaignId: string,
  userId: string,
  userRole: "admin" | "client"
): Promise<boolean> {
  const campaign = await getCampaignById(campaignId);

  if (!campaign) {
    return false;
  }

  if (userRole === "admin") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("memberships")
      .select("tenant_id")
      .eq("user_id", userId)
      .eq("tenant_id", campaign.tenant_id)
      .single();

    return !!data;
  }

  if (USE_CAMPAIGN_ASSIGNMENTS) {
    const supabase = await createClient();
    const { data: membership } = await supabase
      .from("memberships")
      .select("tenant_id")
      .eq("user_id", userId)
      .eq("tenant_id", campaign.tenant_id)
      .single();

    if (!membership) {
      return false;
    }

    const { data: assignment } = await supabase
      .from("campaign_users")
      .select("campaign_id")
      .eq("campaign_id", campaignId)
      .eq("user_id", userId)
      .single();

    return !!assignment;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("memberships")
    .select("tenant_id")
    .eq("user_id", userId)
    .eq("tenant_id", campaign.tenant_id)
    .single();

  return !!data;
}

