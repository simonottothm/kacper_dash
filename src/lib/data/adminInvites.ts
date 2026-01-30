import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export interface Invitation {
  id: string;
  tenant_id: string;
  email: string;
  token: string;
  role: "admin" | "client";
  expires_at: string;
  used_at: string | null;
  created_at: string;
  meta: Record<string, unknown> | null;
}

export async function listTenantInvites(tenantId: string): Promise<Invitation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch invites: ${error.message}`);
  }

  return (data || []) as Invitation[];
}

export async function createInvite(
  tenantId: string,
  email: string,
  role: "admin" | "client",
  expiresInDays: number,
  campaignIds?: string[]
): Promise<Invitation> {
  const supabase = await createClient();

  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const meta: Record<string, unknown> = {};
  if (campaignIds && campaignIds.length > 0) {
    meta.campaignIds = campaignIds;
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      tenant_id: tenantId,
      email,
      token,
      role,
      expires_at: expiresAt.toISOString(),
      meta: Object.keys(meta).length > 0 ? meta : null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invite: ${error.message}`);
  }

  return data as Invitation;
}

export async function getInviteByToken(token: string): Promise<Invitation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (error) {
    return null;
  }

  return data as Invitation;
}

export async function acceptInvite(token: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const invite = await getInviteByToken(token);

  if (!invite) {
    throw new Error("Invalid invite token");
  }

  if (invite.used_at) {
    throw new Error("Invite has already been used");
  }

  const expiresAt = new Date(invite.expires_at);
  if (expiresAt < new Date()) {
    throw new Error("Invite has expired");
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      tenant_id: invite.tenant_id,
      user_id: userId,
      role: invite.role,
    });

  if (membershipError) {
    throw new Error(`Failed to create membership: ${membershipError.message}`);
  }

  const { USE_CAMPAIGN_ASSIGNMENTS } = await import("@/lib/config");
  if (USE_CAMPAIGN_ASSIGNMENTS && invite.meta && Array.isArray(invite.meta.campaignIds)) {
    const campaignIds = invite.meta.campaignIds as string[];
    if (campaignIds.length > 0) {
      const assignments = campaignIds.map((campaignId) => ({
        campaign_id: campaignId,
        user_id: userId,
      }));

      const { error: assignmentError } = await supabase
        .from("campaign_users")
        .insert(assignments);

      if (assignmentError) {
        throw new Error(`Failed to create campaign assignments: ${assignmentError.message}`);
      }
    }
  }

  const { error: updateError } = await supabase
    .from("invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  if (updateError) {
    throw new Error(`Failed to mark invite as used: ${updateError.message}`);
  }
}

