import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { getImportJobById } from "@/lib/data/importJobs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ importId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { importId } = await params;
    const job = await getImportJobById(importId);

    if (!job) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Import job not found" } },
        { status: 404 }
      );
    }

    const isAdmin = await verifyTenantAdmin(job.tenant_id);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        job,
        errorRows: job.error_rows || [],
      },
    });
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

