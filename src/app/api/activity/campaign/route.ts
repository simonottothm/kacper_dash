import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import { verifyCampaignAccess } from "@/lib/data/campaigns";
import { getCampaignActivity } from "@/lib/data/activity";
import { z } from "zod";

const querySchema = z.object({
  campaignId: z.string().uuid(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "campaignId required" } },
        { status: 400 }
      );
    }

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 50) : 20;
    const validated = querySchema.parse({
      campaignId,
      limit: limit.toString(),
    });

    const activeTenantId = await getActiveTenantId(user.id);
    if (!activeTenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "No active tenant" } },
        { status: 403 }
      );
    }

    const memberships = await getMemberships(user.id);
    const activeMembership = memberships.find((m) => m.tenant_id === activeTenantId);

    if (!activeMembership) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant member" } },
        { status: 403 }
      );
    }

    const hasAccess = await verifyCampaignAccess(
      validated.campaignId,
      user.id,
      activeMembership.role
    );

    if (!hasAccess) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "No access to campaign" } },
        { status: 403 }
      );
    }

    const items = await getCampaignActivity(validated.campaignId, validated.limit);

    return NextResponse.json({ ok: true, data: { items } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
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

