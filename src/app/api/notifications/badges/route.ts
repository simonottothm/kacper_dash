import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import { getCampaigns } from "@/lib/data/campaigns";
import { getUserTenantState } from "@/lib/data/userState";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const querySchema = z.object({
  tenantId: z.string().uuid(),
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
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "tenantId required" } },
        { status: 400 }
      );
    }

    const validated = querySchema.parse({ tenantId });

    const activeTenantId = await getActiveTenantId(user.id);
    if (activeTenantId !== validated.tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Invalid tenant" } },
        { status: 403 }
      );
    }

    const memberships = await getMemberships(user.id);
    const activeMembership = memberships.find((m) => m.tenant_id === validated.tenantId);

    if (!activeMembership) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant member" } },
        { status: 403 }
      );
    }

    const campaigns = await getCampaigns(
      validated.tenantId,
      user.id,
      activeMembership.role
    );

    const campaignIds = campaigns.map((c) => c.id);

    if (campaignIds.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          overdueFollowups: 0,
          newUpdates: 0,
        },
      });
    }

    const supabase = await createClient();

    const userState = await getUserTenantState(validated.tenantId, user.id);
    const lastSeenAt = userState?.last_seen_updates_at || new Date(0).toISOString();

    const { data: leads } = await supabase
      .from("leads")
      .select("id")
      .in("campaign_id", campaignIds)
      .eq("is_archived", false);

    const leadIds = (leads || []).map((l) => l.id);

    let overdueFollowups = 0;
    let newUpdates = 0;

    if (leadIds.length > 0) {
      const now = new Date().toISOString();

      const { count: overdueCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .in("id", leadIds)
        .not("next_follow_up_at", "is", null)
        .lt("next_follow_up_at", now);

      overdueFollowups = overdueCount || 0;

      const { count: updatesCount } = await supabase
        .from("lead_updates")
        .select("*", { count: "exact", head: true })
        .in("lead_id", leadIds)
        .gt("created_at", lastSeenAt);

      newUpdates = updatesCount || 0;
    }

    return NextResponse.json({
      ok: true,
      data: {
        overdueFollowups,
        newUpdates,
      },
    });
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

