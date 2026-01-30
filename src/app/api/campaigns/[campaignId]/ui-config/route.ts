import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getCampaignById, verifyCampaignAccess } from "@/lib/data/campaigns";
import { getMemberships } from "@/lib/data/tenants";
import {
  getCampaignUiConfig,
  getDefaultCampaignColumns,
  upsertCampaignUiConfig,
  type CampaignColumnConfig,
} from "@/lib/data/campaignUiConfig";
import { listTenantCustomFields } from "@/lib/data/adminCustomFields";

const columnSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  visible: z.boolean(),
  order: z.number().int().min(1),
});

const payloadSchema = z.object({
  columns: z.array(columnSchema).min(1),
});

const STANDARD_KEYS = new Set([
  "full_name",
  "company",
  "email",
  "phone",
  "status",
  "next_follow_up_at",
  "updated_at",
]);

function normalizeColumns(columns: CampaignColumnConfig[]): CampaignColumnConfig[] {
  return [...columns].sort((a, b) => a.order - b.order);
}

export async function GET(
  _request: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const campaign = await getCampaignById(params.campaignId);
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
      params.campaignId,
      user.id,
      membership.role
    );

    if (!hasAccess) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "No campaign access" } },
        { status: 403 }
      );
    }

    const config = await getCampaignUiConfig(params.campaignId);
    const columns = config?.columns?.length ? config.columns : getDefaultCampaignColumns();

    return NextResponse.json({
      ok: true,
      data: {
        campaignId: params.campaignId,
        tenantId: campaign.tenant_id,
        columns: normalizeColumns(columns),
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

export async function PUT(
  request: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const campaign = await getCampaignById(params.campaignId);
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
      params.campaignId,
      user.id,
      membership.role
    );
    if (!hasAccess) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "No campaign access" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = payloadSchema.parse(body);

    const customFields = await listTenantCustomFields(campaign.tenant_id);
    const customKeys = new Set(
      customFields.map((field) => `custom_fields.${field.field_key || field.key}`)
    );

    const seenKeys = new Set<string>();
    for (const col of validated.columns) {
      if (seenKeys.has(col.key)) {
        return NextResponse.json(
          { ok: false, error: { code: "VALIDATION_ERROR", message: "Duplicate column key" } },
          { status: 400 }
        );
      }
      seenKeys.add(col.key);

      if (!STANDARD_KEYS.has(col.key) && !customKeys.has(col.key)) {
        return NextResponse.json(
          {
            ok: false,
            error: { code: "VALIDATION_ERROR", message: `Unknown column key: ${col.key}` },
          },
          { status: 400 }
        );
      }
    }

    const result = await upsertCampaignUiConfig(
      params.campaignId,
      campaign.tenant_id,
      normalizeColumns(validated.columns)
    );

    return NextResponse.json({
      ok: true,
      data: {
        campaignId: result.campaign_id,
        tenantId: result.tenant_id,
        columns: result.columns,
      },
    });
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

