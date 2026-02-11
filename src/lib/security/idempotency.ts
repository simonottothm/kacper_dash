import { createHash } from "crypto";
import { getServiceClient } from "@/lib/supabase/service";

export function hashIdempotencyKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function checkIdempotency(
  tenantId: string,
  keyHash: string
): Promise<{ exists: boolean; response?: unknown }> {
  const serviceClient = getServiceClient();

  const { data, error } = await (serviceClient as any)
    .from("ingestion_requests")
    .select("response_json")
    .eq("tenant_id", tenantId)
    .eq("key_hash", keyHash)
    .single();

  if (error || !data) {
    return { exists: false };
  }

  return {
    exists: true,
    response: data.response_json,
  };
}

export async function storeIdempotencyResponse(
  tenantId: string,
  keyHash: string,
  response: unknown
): Promise<void> {
  const serviceClient = getServiceClient();

  await (serviceClient as any).from("ingestion_requests").upsert(
    {
      tenant_id: tenantId,
      key_hash: keyHash,
      response_json: response,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: "tenant_id,key_hash",
    }
  );
}

export async function cleanupOldIdempotencyKeys(): Promise<void> {
  const serviceClient = getServiceClient();
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  await (serviceClient as any)
    .from("ingestion_requests")
    .delete()
    .lt("created_at", oneHourAgo.toISOString());
}

