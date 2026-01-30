import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { getCampaignById, updateCampaign } from "@/lib/data/adminCampaigns";
import { z } from "zod";

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  is_archived: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tenantId: string; campaignId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, campaignId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign || campaign.tenant_id !== tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateCampaignSchema.parse(body);

    const updated = await updateCampaign(campaignId, validated);

    return NextResponse.json({ ok: true, data: { campaign: updated } });
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenantId: string; campaignId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { tenantId, campaignId } = await params;
    const isAdmin = await verifyTenantAdmin(tenantId);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant admin" } },
        { status: 403 }
      );
    }

    const campaign = await getCampaignById(campaignId);
    if (!campaign || campaign.tenant_id !== tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    const updated = await updateCampaign(campaignId, { is_archived: !campaign.is_archived });

    return NextResponse.json({ ok: true, data: { campaign: updated } });
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

