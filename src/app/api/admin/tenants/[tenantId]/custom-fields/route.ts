import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { listTenantCustomFields, createCustomField } from "@/lib/data/adminCustomFields";
import { z } from "zod";

const createCustomFieldSchema = z.object({
  field_key: z.string().regex(/^[a-z0-9_]+$/, "Must be snake_case"),
  label: z.string().min(1),
  field_type: z.enum(["text", "number", "select"]),
  options: z.array(z.string()).nullable().optional(),
  is_pinned: z.boolean(),
  sort_order: z.number(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const fields = await listTenantCustomFields(tenantId);

    return NextResponse.json({ ok: true, data: { fields } });
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createCustomFieldSchema.parse(body);

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

    const field = await createCustomField(
      tenantId,
      validated.field_key,
      validated.label,
      validated.field_type,
      validated.field_type === "select" ? validated.options : null,
      validated.is_pinned,
      validated.sort_order
    );

    return NextResponse.json({ ok: true, data: { field } });
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

