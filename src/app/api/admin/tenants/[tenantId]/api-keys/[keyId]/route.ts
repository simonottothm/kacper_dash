import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { listTenantApiKeys, updateApiKeyStatus } from "@/lib/data/apiKeys";
import { z } from "zod";

const updateApiKeySchema = z.object({
  is_active: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tenantId: string; keyId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, keyId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const keys = await listTenantApiKeys(tenantId);
    const key = keys.find((k) => k.id === keyId);

    if (!key) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "API key not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateApiKeySchema.parse(body);

    const updated = await updateApiKeyStatus(keyId, validated.is_active);

    return NextResponse.json({
      ok: true,
      data: {
        apiKey: {
          ...updated,
          key_hash: undefined,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

