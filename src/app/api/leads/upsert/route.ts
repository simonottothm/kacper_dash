import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { hashApiKey } from "@/lib/security/apiKey";
import { getRequestId } from "@/lib/security/requestId";
import { checkRateLimit, getRateLimitKey } from "@/lib/security/rateLimit";
import {
  checkIdempotency,
  storeIdempotencyResponse,
  hashIdempotencyKey,
} from "@/lib/security/idempotency";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
  tooManyRequests,
} from "@/lib/http/apiResponse";
import { z } from "zod";
import type { Lead } from "@/lib/data/leads";
import type { StatusDefinition } from "@/lib/data/adminStatus";

const upsertLeadsSchema = z.object({
  tenantId: z.string().uuid(),
  campaignId: z.string().uuid(),
  dedupeMode: z.enum(["external_id", "email", "phone", "email_or_phone", "none"]),
  leads: z
    .array(
      z.object({
        externalId: z.string().nullable().optional(),
        fullName: z.string().nullable().optional(),
        company: z.string().nullable().optional(),
        email: z.string().email().nullable().optional(),
        phone: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        ownerEmail: z.string().email().nullable().optional(),
        nextFollowUpAt: z.string().datetime().nullable().optional(),
        customFields: z.record(z.unknown()).nullable().optional(),
      })
    )
    .max(1000),
});

const CHUNK_SIZE = 200;

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return unauthorized("x-api-key header required", requestId);
    }

    const body = await request.json();
    const validated = upsertLeadsSchema.parse(body);

    const keyHash = hashApiKey(apiKey);
    const serviceClient = getServiceClient() as any;

    const { data: apiKeyRecord, error: keyError } = await serviceClient
      .from("api_keys")
      .select("id, tenant_id, name")
      .eq("key_hash", keyHash)
      .eq("is_active", true)
      .single();

    if (keyError || !apiKeyRecord || apiKeyRecord.tenant_id !== validated.tenantId) {
      return unauthorized("Invalid or inactive API key", requestId);
    }

    const rateLimitKey = getRateLimitKey(apiKeyRecord.id, "ingestion");
    const rateLimitResult = checkRateLimit(rateLimitKey, 100);

    if (!rateLimitResult.allowed) {
      return tooManyRequests("Rate limit exceeded", requestId);
    }

    const idempotencyKey = request.headers.get("x-idempotency-key");
    if (idempotencyKey) {
      const idempotencyHash = hashIdempotencyKey(idempotencyKey);
      const existing = await checkIdempotency(validated.tenantId, idempotencyHash);

      if (existing.exists && existing.response) {
        return ok(existing.response as { created: number; updated: number; skipped: number }, requestId);
      }
    }

    const { data: campaign, error: campaignError } = await serviceClient
      .from("campaigns")
      .select("id, tenant_id")
      .eq("id", validated.campaignId)
      .eq("tenant_id", validated.tenantId)
      .single();

    if (campaignError || !campaign) {
      return forbidden("Campaign not found", requestId);
    }

    const { data: statusesData } = await serviceClient
      .from("status_definitions")
      .select("id, label")
      .eq("tenant_id", validated.tenantId);

    const statuses = (statusesData || []) as any[];

    const statusMap = new Map<string, string>(
      statuses.map((s: any) => [s.label.toLowerCase(), s.id])
    );

    const stats = {
      created: 0,
      updated: 0,
      skipped: 0,
    };

    const errors: Array<{ index: number; code: string; message: string }> = [];

    for (let chunkStart = 0; chunkStart < validated.leads.length; chunkStart += CHUNK_SIZE) {
      const chunk = validated.leads.slice(chunkStart, chunkStart + CHUNK_SIZE);
      const chunkIndex = chunkStart;

      const externalIds = chunk
        .map((l) => l.externalId?.trim())
        .filter((id): id is string => !!id);
      const emails = chunk
        .map((l) => l.email?.toLowerCase().trim())
        .filter((e): e is string => !!e);
      const phones = chunk
        .map((l) => l.phone?.trim())
        .filter((p): p is string => !!p);

      const existingLeadsMap = new Map<string, Lead>();

      if (validated.dedupeMode === "external_id" && externalIds.length > 0) {
        const { data } = await serviceClient
          .from("leads")
          .select("*")
          .eq("tenant_id", validated.tenantId)
          .in("external_id", externalIds);

        if (data) {
          for (const lead of data) {
            const key = lead.external_id?.trim();
            if (key) {
              existingLeadsMap.set(`external_id:${key}`, lead as Lead);
            }
          }
        }
      } else if (validated.dedupeMode === "email" && emails.length > 0) {
        const { data } = await serviceClient
          .from("leads")
          .select("*")
          .eq("campaign_id", validated.campaignId)
          .in("email", emails);

        if (data) {
          for (const lead of data) {
            const key = lead.email?.toLowerCase().trim();
            if (key) {
              existingLeadsMap.set(`email:${key}`, lead as Lead);
            }
          }
        }
      } else if (validated.dedupeMode === "phone" && phones.length > 0) {
        const { data } = await serviceClient
          .from("leads")
          .select("*")
          .eq("campaign_id", validated.campaignId)
          .in("phone", phones);

        if (data) {
          for (const lead of data) {
            const key = lead.phone?.trim();
            if (key) {
              existingLeadsMap.set(`phone:${key}`, lead as Lead);
            }
          }
        }
      } else if (validated.dedupeMode === "email_or_phone") {
        if (emails.length > 0) {
          const { data } = await serviceClient
            .from("leads")
            .select("*")
            .eq("campaign_id", validated.campaignId)
            .in("email", emails);

          if (data) {
            for (const lead of data) {
              const key = lead.email?.toLowerCase().trim();
              if (key) {
                existingLeadsMap.set(`email:${key}`, lead as Lead);
              }
            }
          }
        }

        if (phones.length > 0) {
          const { data } = await serviceClient
            .from("leads")
            .select("*")
            .eq("campaign_id", validated.campaignId)
            .in("phone", phones);

          if (data) {
            for (const lead of data) {
              const key = lead.phone?.trim();
              if (key && !existingLeadsMap.has(`phone:${key}`)) {
                existingLeadsMap.set(`phone:${key}`, lead as Lead);
              }
            }
          }
        }
      }

      const leadsToInsert: Array<Record<string, unknown>> = [];
      const leadsToUpdate: Array<{ id: string; data: Record<string, unknown> }> = [];

      for (let i = 0; i < chunk.length; i++) {
        const lead = chunk[i];
        const globalIndex = chunkIndex + i;

        try {
          let statusId: string | null = null;
          if (lead.status) {
            const statusIdFromMap = statusMap.get(lead.status.toLowerCase());
            if (statusIdFromMap) {
              statusId = statusIdFromMap;
            } else {
              errors.push({
                index: globalIndex,
                code: "INVALID_STATUS",
                message: `Status "${lead.status}" not found`,
              });
              stats.skipped++;
              continue;
            }
          }

          const leadData: Record<string, unknown> = {
            tenant_id: validated.tenantId,
            campaign_id: validated.campaignId,
            full_name: lead.fullName || null,
            company: lead.company || null,
            email: lead.email?.toLowerCase().trim() || null,
            phone: lead.phone?.trim() || null,
            external_id: lead.externalId?.trim() || null,
            status_id: statusId,
            next_follow_up_at: lead.nextFollowUpAt || null,
            custom_fields: lead.customFields || null,
            updated_at: new Date().toISOString(),
          };

          let existingLead: Lead | null = null;
          let lookupKey: string | null = null;

          if (validated.dedupeMode === "external_id" && lead.externalId) {
            lookupKey = `external_id:${lead.externalId.trim()}`;
            existingLead = existingLeadsMap.get(lookupKey) || null;
          } else if (validated.dedupeMode === "email" && lead.email) {
            lookupKey = `email:${lead.email.toLowerCase().trim()}`;
            existingLead = existingLeadsMap.get(lookupKey) || null;
          } else if (validated.dedupeMode === "phone" && lead.phone) {
            lookupKey = `phone:${lead.phone.trim()}`;
            existingLead = existingLeadsMap.get(lookupKey) || null;
          } else if (validated.dedupeMode === "email_or_phone") {
            if (lead.email) {
              lookupKey = `email:${lead.email.toLowerCase().trim()}`;
              existingLead = existingLeadsMap.get(lookupKey) || null;
            }
            if (!existingLead && lead.phone) {
              lookupKey = `phone:${lead.phone.trim()}`;
              existingLead = existingLeadsMap.get(lookupKey) || null;
            }
          }

          if (existingLead && validated.dedupeMode !== "none") {
            const merged: Record<string, unknown> = {
              id: existingLead.id,
            };

            const standardFields = [
              "full_name",
              "company",
              "email",
              "phone",
              "external_id",
              "status_id",
              "next_follow_up_at",
            ];

            for (const field of standardFields) {
              const incomingValue = leadData[field];
              const existingValue = existingLead[field as keyof Lead];

              if (incomingValue !== null && incomingValue !== undefined && incomingValue !== "") {
                merged[field] = incomingValue;
              } else if (existingValue !== null && existingValue !== undefined) {
                merged[field] = existingValue;
              }
            }

            const existingCustomFields =
              (existingLead.custom_fields as Record<string, unknown>) || {};
            const incomingCustomFields = lead.customFields || {};

            merged.custom_fields = {
              ...existingCustomFields,
              ...incomingCustomFields,
            };

            merged.updated_at = new Date().toISOString();

            leadsToUpdate.push({
              id: existingLead.id,
              data: merged,
            });
            stats.updated++;
          } else {
            leadData.created_at = new Date().toISOString();
            leadsToInsert.push(leadData);
            stats.created++;
          }
        } catch (err) {
          errors.push({
            index: globalIndex,
            code: "PROCESSING_ERROR",
            message: err instanceof Error ? err.message : "Unknown error",
          });
          stats.skipped++;
        }
      }

      if (leadsToInsert.length > 0) {
        const { error: insertError } = await serviceClient
          .from("leads")
          .insert(leadsToInsert);

        if (insertError) {
          throw new Error(`Failed to insert leads: ${insertError.message}`);
        }
      }

      for (const { id, data } of leadsToUpdate) {
        const { error: updateError } = await serviceClient
          .from("leads")
          .update(data)
          .eq("id", id);

        if (updateError) {
          throw new Error(`Failed to update lead: ${updateError.message}`);
        }
      }
    }

    await serviceClient
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyRecord.id);

    const responseData = {
      created: stats.created,
      updated: stats.updated,
      skipped: stats.skipped,
      errors: errors.length > 0 ? errors : undefined,
    };

    if (idempotencyKey) {
      const idempotencyHash = hashIdempotencyKey(idempotencyKey);
      await storeIdempotencyResponse(validated.tenantId, idempotencyHash, responseData);
    }

    return ok(responseData, requestId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("VALIDATION_ERROR", "Invalid request body", error.errors, requestId);
    }

    console.error(`[${requestId}] Upsert error:`, error instanceof Error ? error.message : error);
    return serverError(
      error instanceof Error ? error.message : "Unknown error",
      requestId
    );
  }
}

