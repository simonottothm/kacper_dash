import { createClient } from "@/lib/supabase/server";

export interface NotificationPreferences {
  tenant_id: string;
  user_id: string;
  email_new_updates: boolean;
  email_overdue_followups: boolean;
  digest_frequency: "daily" | "weekly" | "immediate";
  updated_at: string;
}

export async function getNotificationPreferences(
  tenantId: string,
  userId: string
): Promise<NotificationPreferences | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification_prefs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch notification preferences: ${error.message}`);
  }

  return data as NotificationPreferences;
}

export async function upsertNotificationPreferences(
  tenantId: string,
  userId: string,
  preferences: {
    email_new_updates: boolean;
    email_overdue_followups: boolean;
    digest_frequency: "daily" | "weekly" | "immediate";
  }
): Promise<NotificationPreferences> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification_prefs")
    .upsert(
      {
        tenant_id: tenantId,
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "tenant_id,user_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save notification preferences: ${error.message}`);
  }

  return data as NotificationPreferences;
}

export async function listUsersForDigest(
  tenantId: string,
  frequency: "daily" | "weekly",
  serviceClient: ReturnType<typeof import("@/lib/supabase/service").getServiceClient>
): Promise<Array<{ user_id: string; email: string }>> {
  const { data: prefs, error: prefsError } = await (serviceClient as any)
    .from("notification_prefs")
    .select("user_id")
    .eq("tenant_id", tenantId)
    .eq("digest_frequency", frequency)
    .or(`email_new_updates.eq.true,email_overdue_followups.eq.true`);

  if (prefsError) {
    throw new Error(`Failed to fetch notification preferences: ${prefsError.message}`);
  }

  if (!prefs || prefs.length === 0) {
    return [];
  }

  const userIds = (prefs as any[]).map((p) => p.user_id);

  const { data: users, error: usersError } = await serviceClient.auth.admin.listUsers();

  if (usersError) {
    throw new Error(`Failed to fetch users: ${usersError.message}`);
  }

  return (users?.users || [])
    .filter((user) => userIds.includes(user.id))
    .map((user) => ({
      user_id: user.id,
      email: user.email || "",
    }))
    .filter((item) => item.email);
}

