import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { listTenantTemplates, updateTemplate, deleteTemplate } from "@/lib/data/adminTemplates";
import { z } from "zod";

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  update_type: z.enum(["call_attempt", "note"]).optional(),
  default_call_outcome: z.enum(["reached", "not_reached"]).nullable().optional(),
  comment: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tenantId: string; templateId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, templateId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const templates = await listTenantTemplates(tenantId);
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateTemplateSchema.parse(body);

    const updated = await updateTemplate(templateId, validated);

    return NextResponse.json({ ok: true, data: { template: updated } });
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
  { params }: { params: Promise<{ tenantId: string; templateId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, templateId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const templates = await listTenantTemplates(tenantId);
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    await deleteTemplate(templateId);

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

