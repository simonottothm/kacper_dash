import { createClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function listAdminTenants(): Promise<Tenant[]> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("tenant:tenants(id, name, created_at, updated_at)")
    .eq("user_id", user.id)
    .eq("role", "admin");

  if (error) {
    throw new Error(`Failed to fetch admin tenants: ${error.message}`);
  }

  return (data || []).map((item) => item.tenant as Tenant);
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, created_at, updated_at")
    .eq("id", tenantId)
    .single();

  if (error) {
    return null;
  }

  return data as Tenant;
}

export async function verifyTenantAdmin(tenantId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .eq("role", "admin")
    .single();

  return !!data;
}

export async function createTenant(name: string, userId: string): Promise<Tenant> {
  const supabase = getServiceClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({ name })
    .select()
    .single();

  if (tenantError || !tenant) {
    throw new Error(`Failed to create tenant: ${tenantError?.message || "Unknown error"}`);
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      tenant_id: tenant.id,
      user_id: userId,
      role: "admin",
    });

  if (membershipError) {
    throw new Error(`Failed to create membership: ${membershipError.message}`);
  }

  return tenant as Tenant;
}

