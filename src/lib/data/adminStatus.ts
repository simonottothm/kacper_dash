import { createClient } from "@/lib/supabase/server";

export interface StatusDefinition {
  id: string;
  tenant_id: string;
  label: string;
  sort_order: number;
  is_default: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export async function listTenantStatuses(tenantId: string): Promise<StatusDefinition[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("status_definitions")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch statuses: ${error.message}`);
  }

  return (data || []) as StatusDefinition[];
}

export async function createStatus(
  tenantId: string,
  label: string,
  sortOrder: number,
  isDefault: boolean,
  isClosed: boolean
): Promise<StatusDefinition> {
  const supabase = await createClient();

  if (isDefault) {
    await supabase
      .from("status_definitions")
      .update({ is_default: false })
      .eq("tenant_id", tenantId)
      .eq("is_default", true);
  }

  const { data, error } = await supabase
    .from("status_definitions")
    .insert({
      tenant_id: tenantId,
      label,
      sort_order: sortOrder,
      is_default: isDefault,
      is_closed: isClosed,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create status: ${error.message}`);
  }

  return data as StatusDefinition;
}

export async function updateStatus(
  statusId: string,
  updates: {
    label?: string;
    sort_order?: number;
    is_default?: boolean;
    is_closed?: boolean;
  },
  tenantId: string
): Promise<StatusDefinition> {
  const supabase = await createClient();

  if (updates.is_default) {
    await supabase
      .from("status_definitions")
      .update({ is_default: false })
      .eq("tenant_id", tenantId)
      .eq("is_default", true)
      .neq("id", statusId);
  }

  const { data, error } = await supabase
    .from("status_definitions")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", statusId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  return data as StatusDefinition;
}

export async function deleteStatus(statusId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("status_definitions")
    .delete()
    .eq("id", statusId);

  if (error) {
    throw new Error(`Failed to delete status: ${error.message}`);
  }
}

export async function reorderStatuses(
  tenantId: string,
  statusOrders: Array<{ id: string; sort_order: number }>
): Promise<void> {
  const supabase = await createClient();

  for (const { id, sort_order } of statusOrders) {
    const { error } = await supabase
      .from("status_definitions")
      .update({ sort_order })
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      throw new Error(`Failed to reorder status: ${error.message}`);
    }
  }
}

