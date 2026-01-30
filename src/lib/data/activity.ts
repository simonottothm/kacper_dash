import { createClient } from "@/lib/supabase/server";

export interface ActivityItem {
  id: string;
  createdAt: string;
  type: "call_attempt" | "note" | "status_change" | "follow_up";
  callOutcome: "reached" | "not_reached" | null;
  comment: string | null;
  leadId: string;
  leadName: string | null;
  company: string | null;
  campaignId: string;
  campaignName: string;
}

export async function getTenantActivity(
  tenantId: string,
  limit: number = 20
): Promise<ActivityItem[]> {
  const cappedLimit = Math.min(limit, 50);
  const supabase = await createClient();

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("tenant_id", tenantId);

  if (campaignsError) {
    throw new Error(`Failed to fetch campaigns: ${campaignsError.message}`);
  }

  const campaignIds = (campaigns || []).map((c) => c.id);

  if (campaignIds.length === 0) {
    return [];
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id")
    .in("campaign_id", campaignIds);

  if (leadsError) {
    throw new Error(`Failed to fetch leads: ${leadsError.message}`);
  }

  const leadIds = (leads || []).map((l) => l.id);

  if (leadIds.length === 0) {
    return [];
  }

  const { data: updates, error: updatesError } = await supabase
    .from("lead_updates")
    .select("id, created_at, update_type, call_outcome, comment, lead_id")
    .in("lead_id", leadIds)
    .order("created_at", { ascending: false })
    .limit(cappedLimit);

  if (updatesError) {
    throw new Error(`Failed to fetch updates: ${updatesError.message}`);
  }

  const updateLeadIds = (updates || []).map((u) => u.lead_id);
  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, full_name, company, campaign_id")
    .in("id", updateLeadIds);

  const { data: campaignsData } = await supabase
    .from("campaigns")
    .select("id, name")
    .in("id", Array.from(new Set((leadsData || []).map((l) => l.campaign_id))));

  const leadsMap = new Map((leadsData || []).map((l) => [l.id, l]));
  const campaignsMap = new Map((campaignsData || []).map((c) => [c.id, c]));

  return (updates || []).map((update) => {
    const lead = leadsMap.get(update.lead_id);
    const campaign = lead ? campaignsMap.get(lead.campaign_id) : null;

    return {
      id: update.id,
      createdAt: update.created_at,
      type: update.update_type as ActivityItem["type"],
      callOutcome: update.call_outcome as ActivityItem["callOutcome"],
      comment: update.comment,
      leadId: update.lead_id,
      leadName: lead?.full_name || null,
      company: lead?.company || null,
      campaignId: lead?.campaign_id || "",
      campaignName: campaign?.name || "",
    };
  });
}

export async function getCampaignActivity(
  campaignId: string,
  limit: number = 20
): Promise<ActivityItem[]> {
  const cappedLimit = Math.min(limit, 50);
  const supabase = await createClient();

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id")
    .eq("campaign_id", campaignId);

  if (leadsError) {
    throw new Error(`Failed to fetch campaign leads: ${leadsError.message}`);
  }

  const leadIds = (leads || []).map((l) => l.id);

  if (leadIds.length === 0) {
    return [];
  }

  const { data: updates, error: updatesError } = await supabase
    .from("lead_updates")
    .select("id, created_at, update_type, call_outcome, comment, lead_id")
    .in("lead_id", leadIds)
    .order("created_at", { ascending: false })
    .limit(cappedLimit);

  if (updatesError) {
    throw new Error(`Failed to fetch updates: ${updatesError.message}`);
  }

  const updateLeadIds = (updates || []).map((u) => u.lead_id);
  const { data: leadsData } = await supabase
    .from("leads")
    .select("id, full_name, company, campaign_id")
    .in("id", updateLeadIds);

  const { data: campaignData } = await supabase
    .from("campaigns")
    .select("id, name")
    .eq("id", campaignId)
    .single();

  const leadsMap = new Map((leadsData || []).map((l) => [l.id, l]));

  return (updates || []).map((update) => {
    const lead = leadsMap.get(update.lead_id);

    return {
      id: update.id,
      createdAt: update.created_at,
      type: update.update_type as ActivityItem["type"],
      callOutcome: update.call_outcome as ActivityItem["callOutcome"],
      comment: update.comment,
      leadId: update.lead_id,
      leadName: lead?.full_name || null,
      company: lead?.company || null,
      campaignId: campaignId,
      campaignName: campaignData?.name || "",
    };
  });
}

