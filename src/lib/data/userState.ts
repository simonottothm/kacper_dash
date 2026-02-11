import { createClient } from "@/lib/supabase/server";

export interface UserTenantState {
  tenant_id: string;
  user_id: string;
  last_seen_updates_at: string | null;
  last_digest_sent_at: string | null;
}

export async function getUserTenantState(
  tenantId: string,
  userId: string
): Promise<UserTenantState | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_tenant_state")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch user state: ${error.message}`);
  }

  return data as UserTenantState;
}

export async function upsertUserTenantState(
  tenantId: string,
  userId: string,
  updates: {
    last_seen_updates_at?: string | null;
    last_digest_sent_at?: string | null;
  }
): Promise<UserTenantState> {
  const supabase = await createClient();

  const existing = await getUserTenantState(tenantId, userId);

  const { data, error } = await supabase
    .from("user_tenant_state")
    .upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        last_seen_updates_at:
          updates.last_seen_updates_at !== undefined
            ? updates.last_seen_updates_at
            : existing?.last_seen_updates_at || new Date().toISOString(),
        last_digest_sent_at:
          updates.last_digest_sent_at !== undefined
            ? updates.last_digest_sent_at
            : existing?.last_digest_sent_at || null,
      },
      {
        onConflict: "tenant_id,user_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save user state: ${error.message}`);
  }

  return data as UserTenantState;
}

export async function markUpdatesSeen(tenantId: string, userId: string): Promise<void> {
  await upsertUserTenantState(tenantId, userId, {
    last_seen_updates_at: new Date().toISOString(),
  });
}

export async function upsertUserTenantStateWithService(
  serviceClient: ReturnType<typeof import("@/lib/supabase/service").getServiceClient>,
  tenantId: string,
  userId: string,
  updates: {
    last_seen_updates_at?: string | null;
    last_digest_sent_at?: string | null;
  }
): Promise<void> {
  const { data: existing } = await (serviceClient as any)
    .from("user_tenant_state")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  await (serviceClient as any)
    .from("user_tenant_state")
    .upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        last_seen_updates_at:
          updates.last_seen_updates_at !== undefined
            ? updates.last_seen_updates_at
            : existing?.last_seen_updates_at || new Date().toISOString(),
        last_digest_sent_at:
          updates.last_digest_sent_at !== undefined
            ? updates.last_digest_sent_at
            : existing?.last_digest_sent_at || null,
      },
      {
        onConflict: "tenant_id,user_id",
      }
    );
}

export async function getUserTenantStateWithService(
  serviceClient: ReturnType<typeof import("@/lib/supabase/service").getServiceClient>,
  tenantId: string,
  userId: string
): Promise<UserTenantState | null> {
  const { data, error } = await (serviceClient as any)
    .from("user_tenant_state")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch user state: ${error.message}`);
  }

  return data as UserTenantState;
}

