import { createClient } from "@/lib/supabase/server";

export interface LeadUpdate {
  id: string;
  tenant_id: string;
  lead_id: string;
  created_by: string;
  update_type: "call_attempt" | "note" | "status_change" | "follow_up";
  call_outcome: "reached" | "not_reached" | null;
  comment: string | null;
  from_status_id: string | null;
  to_status_id: string | null;
  follow_up_at: string | null;
  created_at: string;
}

export async function listLeadUpdates(leadId: string): Promise<LeadUpdate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lead_updates")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch lead updates: ${error.message}`);
  }

  return (data || []) as LeadUpdate[];
}

