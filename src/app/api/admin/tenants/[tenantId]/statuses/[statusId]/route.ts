import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { listTenantStatuses, updateStatus, deleteStatus } from "@/lib/data/adminStatus";
import { z } from "zod";

const updateStatusSchema = z.object({
  label: z.string().min(1).optional(),
  sort_order: z.number().optional(),
  is_default: z.boolean().optional(),
  is_closed: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tenantId: string; statusId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, statusId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const statuses = await listTenantStatuses(tenantId);
    const status = statuses.find((s) => s.id === statusId);

    if (!status) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Status not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateStatusSchema.parse(body);

    const updated = await updateStatus(statusId, validated, tenantId);

    return NextResponse.json({ ok: true, data: { status: updated } });
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
  { params }: { params: Promise<{ tenantId: string; statusId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, statusId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const statuses = await listTenantStatuses(tenantId);
    const status = statuses.find((s) => s.id === statusId);

    if (!status) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Status not found" } },
        { status: 404 }
      );
    }

    await deleteStatus(statusId);

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

