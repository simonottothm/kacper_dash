import { createClient } from "@/lib/supabase/server";

export interface CustomFieldDefinition {
  id: string;
  tenant_id: string;
  field_key: string;
  key?: string;
  label: string;
  field_type: "text" | "number" | "select";
  options: string[] | null;
  is_pinned: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function listTenantCustomFields(tenantId: string): Promise<CustomFieldDefinition[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_field_definitions")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch custom fields: ${error.message}`);
  }

  return (data || []) as CustomFieldDefinition[];
}

export async function createCustomField(
  tenantId: string,
  fieldKey: string,
  label: string,
  fieldType: "text" | "number" | "select",
  options: string[] | null,
  isPinned: boolean,
  sortOrder: number
): Promise<CustomFieldDefinition> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_field_definitions")
    .insert({
      tenant_id: tenantId,
      field_key: fieldKey,
      label,
      field_type: fieldType,
      options,
      is_pinned: isPinned,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create custom field: ${error.message}`);
  }

  return data as CustomFieldDefinition;
}

export async function updateCustomField(
  fieldId: string,
  updates: {
    field_key?: string;
    label?: string;
    field_type?: "text" | "number" | "select";
    options?: string[] | null;
    is_pinned?: boolean;
    sort_order?: number;
  }
): Promise<CustomFieldDefinition> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("custom_field_definitions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fieldId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update custom field: ${error.message}`);
  }

  return data as CustomFieldDefinition;
}

export async function deleteCustomField(fieldId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("custom_field_definitions")
    .delete()
    .eq("id", fieldId);

  if (error) {
    throw new Error(`Failed to delete custom field: ${error.message}`);
  }
}

