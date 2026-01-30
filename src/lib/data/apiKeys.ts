import { createClient } from "@/lib/supabase/server";
import { generateApiKey, hashApiKey } from "@/lib/security/apiKey";

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_hash: string;
  is_active: boolean;
  last_used_at: string | null;
  created_by: string;
  created_at: string;
}

export async function listTenantApiKeys(tenantId: string): Promise<ApiKey[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return (data || []) as ApiKey[];
}

export async function createApiKey(
  tenantId: string,
  userId: string,
  name: string
): Promise<{ apiKey: ApiKey; plaintextKey: string }> {
  const supabase = await createClient();
  const plaintextKey = generateApiKey();
  const keyHash = hashApiKey(plaintextKey);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      tenant_id: tenantId,
      name,
      key_hash: keyHash,
      is_active: true,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return {
    apiKey: data as ApiKey,
    plaintextKey,
  };
}

export async function updateApiKeyStatus(
  keyId: string,
  isActive: boolean
): Promise<ApiKey> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("api_keys")
    .update({ is_active: isActive })
    .eq("id", keyId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update API key: ${error.message}`);
  }

  return data as ApiKey;
}

export async function getApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error) {
    return null;
  }

  return data as ApiKey;
}

export async function updateApiKeyLastUsed(keyId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyId);
}

