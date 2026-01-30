import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { verifyTenantAdmin } from "@/lib/data/adminTenants";
import { getCampaignById } from "@/lib/data/adminCampaigns";
import { listTenantStatuses } from "@/lib/data/adminStatus";
import { listTenantCustomFields } from "@/lib/data/adminCustomFields";
import { parseCSV } from "@/lib/import/csv";
import { mapRow, type FieldMapping } from "@/lib/import/mapping";
import { validateRow, parseNextFollowUp } from "@/lib/import/validation";
import { findExistingLeads, dedupeLead, mergeLeadData, type DedupeMode } from "@/lib/import/dedupe";
import { createImportJob } from "@/lib/data/importJobs";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const importSchema = z.object({
  fileName: z.string().min(1),
  csvText: z.string().min(1),
  mapping: z.record(z.string()),
  dedupeMode: z.enum(["email_or_phone", "external_id", "none"]),
  defaultStatusLabel: z.string().optional(),
  onError: z.enum(["skip_row", "fail_import"]).default("skip_row"),
});

const CHUNK_SIZE = 200;

export async function GET(
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

    const { listCampaignImportJobs } = await import("@/lib/data/importJobs");
    const jobs = await listCampaignImportJobs(tenantId, campaignId);

    return NextResponse.json({ ok: true, data: { jobs } });
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
    const validated = importSchema.parse(body);

    const [statuses, customFields] = await Promise.all([
      listTenantStatuses(tenantId),
      listTenantCustomFields(tenantId),
    ]);

    const parsed = parseCSV(validated.csvText);
    if (parsed.errors.length > 0 && validated.onError === "fail_import") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "CSV_PARSE_ERROR",
            message: "Failed to parse CSV",
            details: parsed.errors,
          },
        },
        { status: 400 }
      );
    }

    const stats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errorsCount: 0,
    };

    const errorRows: Array<{ row: number; data: Record<string, unknown>; errors: string[] }> = [];
    const leadsToInsert: Array<Record<string, unknown>> = [];
    const leadsToUpdate: Array<{ id: string; data: Record<string, unknown> }> = [];

    const defaultStatus = validated.defaultStatusLabel
      ? statuses.find((s) => s.label.toLowerCase() === validated.defaultStatusLabel!.toLowerCase())
      : null;

    const candidates = parsed.rows.map((row) => {
      const mapped = mapRow(row, validated.mapping as FieldMapping);
      return {
        email: mapped.email as string | undefined,
        phone: mapped.phone as string | undefined,
        external_id: mapped.external_id as string | undefined,
      };
    });

    const existingLeadsMap = await findExistingLeads(campaignId, candidates);

    for (let i = 0; i < parsed.rows.length; i++) {
      const csvRow = parsed.rows[i];
      const rowNumber = i + 2;

      try {
        let mapped = mapRow(csvRow, validated.mapping as FieldMapping);

        const validatedResult = validateRow(mapped, statuses, customFields);

        if (validatedResult.errors.length > 0) {
          if (validated.onError === "fail_import") {
            return NextResponse.json(
              {
                ok: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: `Row ${rowNumber} validation failed`,
                  details: validatedResult.errors,
                },
              },
              { status: 400 }
            );
          }

          errorRows.push({
            row: rowNumber,
            data: mapped,
            errors: validatedResult.errors.map((e) => `${e.field}: ${e.message}`),
          });
          stats.skipped++;
          continue;
        }

        mapped = validatedResult.data;

        if (mapped.status_label) {
          const status = statuses.find(
            (s) => s.label.toLowerCase() === String(mapped.status_label).toLowerCase()
          );
          if (status) {
            mapped.status_id = status.id;
          }
          delete mapped.status_label;
        } else if (defaultStatus) {
          mapped.status_id = defaultStatus.id;
        }

        if (mapped.next_follow_up_at) {
          const parsedDate = parseNextFollowUp(mapped.next_follow_up_at);
          if (parsedDate) {
            mapped.next_follow_up_at = parsedDate;
          } else {
            delete mapped.next_follow_up_at;
          }
        }

        const customFieldsData: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(mapped)) {
          if (key.startsWith("custom.")) {
            const fieldKey = key.replace("custom.", "");
            customFieldsData[fieldKey] = value;
            delete mapped[key];
          }
        }

        if (Object.keys(customFieldsData).length > 0) {
          mapped.custom_fields = customFieldsData;
        }

        const dedupeResult = await dedupeLead(
          campaignId,
          tenantId,
          mapped,
          validated.dedupeMode as DedupeMode,
          existingLeadsMap
        );

        if (dedupeResult.shouldUpdate && dedupeResult.existingLead) {
          const merged = mergeLeadData(dedupeResult.existingLead, mapped);
          leadsToUpdate.push({
            id: dedupeResult.existingLead.id,
            data: {
              ...merged,
              updated_at: new Date().toISOString(),
            },
          });
          stats.updated++;
        } else {
          leadsToInsert.push({
            tenant_id: tenantId,
            campaign_id: campaignId,
            ...mapped,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          stats.created++;
        }
      } catch (err) {
        if (validated.onError === "fail_import") {
          return NextResponse.json(
            {
              ok: false,
              error: {
                code: "PROCESSING_ERROR",
                message: `Row ${rowNumber} processing failed`,
                details: err instanceof Error ? err.message : "Unknown error",
              },
            },
            { status: 500 }
          );
        }

        errorRows.push({
          row: rowNumber,
          data: csvRow as Record<string, unknown>,
          errors: [err instanceof Error ? err.message : "Unknown error"],
        });
        stats.skipped++;
      }
    }

    stats.errorsCount = errorRows.length;

    const supabase = await createClient();

    for (let i = 0; i < leadsToInsert.length; i += CHUNK_SIZE) {
      const chunk = leadsToInsert.slice(i, i + CHUNK_SIZE);
      const { error } = await supabase.from("leads").insert(chunk);

      if (error) {
        throw new Error(`Failed to insert leads: ${error.message}`);
      }
    }

    for (let i = 0; i < leadsToUpdate.length; i += CHUNK_SIZE) {
      const chunk = leadsToUpdate.slice(i, i + CHUNK_SIZE);
      for (const { id, data } of chunk) {
        const { error } = await supabase.from("leads").update(data).eq("id", id);

        if (error) {
          throw new Error(`Failed to update lead: ${error.message}`);
        }
      }
    }

    const importJob = await createImportJob(
      tenantId,
      campaignId,
      user.id,
      validated.fileName,
      validated.mapping,
      stats,
      errorRows
    );

    return NextResponse.json({
      ok: true,
      data: {
        importId: importJob.id,
        stats,
        errorsCount: stats.errorsCount,
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

