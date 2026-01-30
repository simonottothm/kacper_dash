import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { listTenantCustomFields, updateCustomField, deleteCustomField } from "@/lib/data/adminCustomFields";
import { z } from "zod";

const updateCustomFieldSchema = z.object({
  field_key: z.string().regex(/^[a-z0-9_]+$/).optional(),
  label: z.string().min(1).optional(),
  field_type: z.enum(["text", "number", "select"]).optional(),
  options: z.array(z.string()).nullable().optional(),
  is_pinned: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tenantId: string; fieldId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, fieldId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const fields = await listTenantCustomFields(tenantId);
    const field = fields.find((f) => f.id === fieldId);

    if (!field) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Custom field not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateCustomFieldSchema.parse(body);

    if (validated.field_type === "select" && (!validated.options || validated.options.length === 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Options are required for select field type",
          },
        },
        { status: 400 }
      );
    }

    const updated = await updateCustomField(fieldId, validated);

    return NextResponse.json({ ok: true, data: { field: updated } });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tenantId: string; fieldId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, fieldId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const fields = await listTenantCustomFields(tenantId);
    const field = fields.find((f) => f.id === fieldId);

    if (!field) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Custom field not found" } },
        { status: 404 }
      );
    }

    await deleteCustomField(fieldId);

    return NextResponse.json({ ok: true });
  } catch (error) {
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

