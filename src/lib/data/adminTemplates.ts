import { createClient } from "@/lib/supabase/server";

export interface UpdateTemplate {
  id: string;
  tenant_id: string;
  name: string;
  update_type: "call_attempt" | "note";
  default_call_outcome: "reached" | "not_reached" | null;
  comment: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function listTenantTemplates(tenantId: string): Promise<UpdateTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("update_templates")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  return (data || []) as UpdateTemplate[];
}

export async function createTemplate(
  tenantId: string,
  name: string,
  updateType: "call_attempt" | "note",
  defaultCallOutcome: "reached" | "not_reached" | null,
  comment: string | null,
  sortOrder: number
): Promise<UpdateTemplate> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("update_templates")
    .insert({
      tenant_id: tenantId,
      name,
      update_type: updateType,
      default_call_outcome: defaultCallOutcome,
      comment,
      is_active: true,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create template: ${error.message}`);
  }

  return data as UpdateTemplate;
}

export async function updateTemplate(
  templateId: string,
  updates: {
    name?: string;
    update_type?: "call_attempt" | "note";
    default_call_outcome?: "reached" | "not_reached" | null;
    comment?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }
): Promise<UpdateTemplate> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("update_templates")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update template: ${error.message}`);
  }

  return data as UpdateTemplate;
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("update_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    throw new Error(`Failed to delete template: ${error.message}`);
  }
}

