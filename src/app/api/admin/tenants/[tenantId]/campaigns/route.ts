import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { listTenantCampaigns, createCampaign } from "@/lib/data/adminCampaigns";
import { z } from "zod";

const createCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
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

    const campaigns = await listTenantCampaigns(tenantId);

    return NextResponse.json({ ok: true, data: { campaigns } });
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
    const validated = createCampaignSchema.parse(body);

    const campaign = await createCampaign(tenantId, validated.name, validated.description || null);

    return NextResponse.json({ ok: true, data: { campaign } });
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

