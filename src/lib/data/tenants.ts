import { createClient } from "@/lib/supabase/server";

export interface Membership {
  tenant_id: string;
  user_id: string;
  role: "admin" | "client";
  tenant: {
    id: string;
    name: string;
  };
}

export async function getMemberships(userId: string): Promise<Membership[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("tenant_id, user_id, role, tenant:tenants(id, name)")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch memberships: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    tenant_id: item.tenant_id,
    user_id: item.user_id,
    role: item.role as "admin" | "client",
    tenant: item.tenant as { id: string; name: string },
  }));
}

export async function getTenantById(tenantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("id", tenantId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

