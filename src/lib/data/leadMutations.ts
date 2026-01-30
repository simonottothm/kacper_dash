import { createClient } from "@/lib/supabase/server";
import { getLeadById } from "@/lib/data/leads";

export interface CreateLeadUpdateArgs {
  leadId: string;
  type: "call_attempt" | "note";
  callOutcome?: "reached" | "not_reached" | null;
  comment?: string | null;
  userId: string;
  tenantId: string;
}

export interface ChangeLeadStatusArgs {
  leadId: string;
  statusId: string | null;
  userId: string;
  tenantId: string;
}

export interface SetLeadFollowupArgs {
  leadId: string;
  nextFollowUpAt: string | null;
  userId: string;
  tenantId: string;
}

export async function createLeadUpdate(args: CreateLeadUpdateArgs) {
  const supabase = await createClient();

  const lead = await getLeadById(args.leadId);
  if (!lead || lead.tenant_id !== args.tenantId) {
    throw new Error("Lead not found or access denied");
  }

  const { data, error } = await supabase
    .from("lead_updates")
    .insert({
      tenant_id: args.tenantId,
      lead_id: args.leadId,
      created_by: args.userId,
      update_type: args.type,
      call_outcome: args.type === "call_attempt" ? args.callOutcome : null,
      comment: args.comment || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead update: ${error.message}`);
  }

  return data;
}

export async function changeLeadStatus(args: ChangeLeadStatusArgs) {
  const supabase = await createClient();

  const lead = await getLeadById(args.leadId);
  if (!lead || lead.tenant_id !== args.tenantId) {
    throw new Error("Lead not found or access denied");
  }

  const fromStatusId = lead.status_id;

  const { error: updateError } = await supabase
    .from("leads")
    .update({
      status_id: args.statusId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", args.leadId);

  if (updateError) {
    throw new Error(`Failed to update lead status: ${updateError.message}`);
  }

  const { error: insertError } = await supabase
    .from("lead_updates")
    .insert({
      tenant_id: args.tenantId,
      lead_id: args.leadId,
      created_by: args.userId,
      update_type: "status_change",
      from_status_id: fromStatusId,
      to_status_id: args.statusId,
      comment: null,
    });

  if (insertError) {
    throw new Error(`Failed to log status change: ${insertError.message}`);
  }
}

export async function setLeadFollowup(args: SetLeadFollowupArgs) {
  const supabase = await createClient();

  const lead = await getLeadById(args.leadId);
  if (!lead || lead.tenant_id !== args.tenantId) {
    throw new Error("Lead not found or access denied");
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({
      next_follow_up_at: args.nextFollowUpAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", args.leadId);

  if (updateError) {
    throw new Error(`Failed to update lead follow-up: ${updateError.message}`);
  }

  const { error: insertError } = await supabase
    .from("lead_updates")
    .insert({
      tenant_id: args.tenantId,
      lead_id: args.leadId,
      created_by: args.userId,
      update_type: "follow_up",
      follow_up_at: args.nextFollowUpAt,
      comment: null,
    });

  if (insertError) {
    throw new Error(`Failed to log follow-up change: ${insertError.message}`);
  }
}

