import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/http/apiResponse";
import { generateRequestId } from "@/lib/security/requestId";

export async function GET() {
  const requestId = generateRequestId();

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("tenants").select("id").limit(1);

    if (error) {
      return serverError("Database connection failed", requestId, { error: error.message });
    }

    return ok({ status: "healthy", timestamp: new Date().toISOString() }, requestId);
  } catch (error) {
    return serverError(
      "Health check failed",
      requestId,
      error instanceof Error ? { error: error.message } : undefined
    );
  }
}

