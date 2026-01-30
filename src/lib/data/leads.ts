import { createClient } from "@/lib/supabase/server";

export interface Lead {
  id: string;
  tenant_id: string;
  campaign_id: string;
  full_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  external_id: string | null;
  status_id: string | null;
  owner_user_id: string | null;
  next_follow_up_at: string | null;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface StatusDefinition {
  id: string;
  tenant_id: string;
  label: string;
  sort_order: number;
}

export interface LeadListResult {
  rows: Lead[];
  total: number;
}

export interface LeadListArgs {
  campaignId: string;
  q?: string;
  statusId?: string;
  followup?: "overdue" | "today" | "none";
  sort?: "updated_desc" | "created_desc" | "followup_asc";
  page?: number;
  pageSize?: number;
}

export async function listLeads(args: LeadListArgs): Promise<LeadListResult> {
  const supabase = await createClient();
  const page = args.page || 1;
  const pageSize = args.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("campaign_id", args.campaignId);

  if (args.q) {
    const searchTerm = `%${args.q}%`;
    query = query.or(
      `full_name.ilike.${searchTerm},company.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
    );
  }

  if (args.statusId) {
    query = query.eq("status_id", args.statusId);
  }

  if (args.followup === "overdue") {
    const now = new Date().toISOString();
    query = query.lt("next_follow_up_at", now).not("next_follow_up_at", "is", null);
  } else if (args.followup === "today") {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);
    query = query
      .gte("next_follow_up_at", startOfToday.toISOString())
      .lte("next_follow_up_at", endOfToday.toISOString());
  } else if (args.followup === "none") {
    query = query.is("next_follow_up_at", null);
  }

  if (args.sort === "created_desc") {
    query = query.order("created_at", { ascending: false });
  } else if (args.sort === "followup_asc") {
    query = query.order("next_follow_up_at", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }

  return {
    rows: (data || []) as Lead[],
    total: count || 0,
  };
}

export async function getLeadById(leadId: string): Promise<Lead | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (error) {
    return null;
  }

  return data as Lead;
}

export async function listLeadsByStatus(
  campaignId: string,
  statusId: string | null
): Promise<Lead[]> {
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("is_archived", false);

  if (statusId === null) {
    query = query.is("status_id", null);
  } else {
    query = query.eq("status_id", statusId);
  }

  const { data, error } = await query.order("updated_at", { ascending: false }).limit(100);

  if (error) {
    throw new Error(`Failed to fetch leads by status: ${error.message}`);
  }

  return (data || []) as Lead[];
}

export async function getLeadSummaryById(leadId: string): Promise<{
  id: string;
  full_name: string | null;
  company: string | null;
  campaign_id: string;
} | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("id, full_name, company, campaign_id")
    .eq("id", leadId)
    .single();

  if (error) {
    return null;
  }

  return data as {
    id: string;
    full_name: string | null;
    company: string | null;
    campaign_id: string;
  };
}

export async function listStatusesForTenant(tenantId: string): Promise<StatusDefinition[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("status_definitions")
    .select("id, tenant_id, label, sort_order")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) {
    return [];
  }

  return (data || []) as StatusDefinition[];
}

