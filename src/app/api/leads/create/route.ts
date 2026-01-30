import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getCampaignById, verifyCampaignAccess } from "@/lib/data/campaigns";
import { getMemberships } from "@/lib/data/tenants";
import { createClient } from "@/lib/supabase/server";

const payloadSchema = z.object({
  campaignId: z.string().uuid(),
  fullName: z.string().min(1).optional().nullable(),
  company: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  statusId: z.string().uuid().optional().nullable(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  customFields: z.record(z.string(), z.any()).optional().nullable(),
});

function normalizeValue(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = payloadSchema.parse(body);

    const campaign = await getCampaignById(validated.campaignId);
    if (!campaign) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Campaign not found" } },
        { status: 404 }
      );
    }

    const memberships = await getMemberships(user.id);
    const membership = memberships.find((m) => m.tenant_id === campaign.tenant_id);
    if (!membership) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Not a tenant member" } },
        { status: 403 }
      );
    }

    const hasAccess = await verifyCampaignAccess(
      validated.campaignId,
      user.id,
      membership.role
    );
    if (!hasAccess) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "No campaign access" } },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        tenant_id: campaign.tenant_id,
        campaign_id: validated.campaignId,
        full_name: normalizeValue(validated.fullName),
        company: normalizeValue(validated.company),
        email: normalizeValue(validated.email),
        phone: normalizeValue(validated.phone),
        status_id: validated.statusId || null,
        next_follow_up_at: validated.nextFollowUpAt || null,
        custom_fields: validated.customFields || {},
        owner_user_id: user.id,
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INTERNAL_ERROR",
            message: error?.message || "Failed to create lead",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: { lead: data } });
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

