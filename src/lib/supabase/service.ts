import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let serviceClient: ReturnType<typeof createClient> | null = null;

export function getServiceClient() {
  if (serviceClient) {
    return serviceClient;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  serviceClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}

