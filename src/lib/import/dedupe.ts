import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/data/leads";

export type DedupeMode = "email_or_phone" | "external_id" | "none";

export interface LeadCandidate {
  email?: string;
  phone?: string;
  external_id?: string;
}

export interface DedupeResult {
  existingLead: Lead | null;
  shouldUpdate: boolean;
}

export async function findExistingLeads(
  campaignId: string,
  candidates: LeadCandidate[]
): Promise<Map<string, Lead>> {
  const supabase = await createClient();
  const leadMap = new Map<string, Lead>();

  const emails = candidates
    .map((c) => c.email?.toLowerCase().trim())
    .filter((e): e is string => !!e);
  const phones = candidates
    .map((c) => c.phone?.trim())
    .filter((p): p is string => !!p);
  const externalIds = candidates
    .map((c) => c.external_id?.trim())
    .filter((id): id is string => !!id);

  if (emails.length > 0) {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("campaign_id", campaignId)
      .in("email", emails);

    if (data) {
      for (const lead of data) {
        const key = lead.email?.toLowerCase().trim();
        if (key) {
          leadMap.set(`email:${key}`, lead as Lead);
        }
      }
    }
  }

  if (phones.length > 0) {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("campaign_id", campaignId)
      .in("phone", phones);

    if (data) {
      for (const lead of data) {
        const key = lead.phone?.trim();
        if (key && !leadMap.has(`phone:${key}`)) {
          leadMap.set(`phone:${key}`, lead as Lead);
        }
      }
    }
  }

  if (externalIds.length > 0) {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("campaign_id", campaignId)
      .in("external_id", externalIds);

    if (data) {
      for (const lead of data) {
        const key = (lead as Lead).external_id?.trim();
        if (key) {
          leadMap.set(`external_id:${key}`, lead as Lead);
        }
      }
    }
  }

  return leadMap;
}

export async function dedupeLead(
  campaignId: string,
  tenantId: string,
  mappedRow: Record<string, unknown>,
  dedupeMode: DedupeMode,
  existingLeadsMap: Map<string, Lead>
): Promise<DedupeResult> {
  if (dedupeMode === "none") {
    return { existingLead: null, shouldUpdate: false };
  }

  let lookupKey: string | null = null;

  if (dedupeMode === "external_id" && mappedRow.external_id) {
    lookupKey = `external_id:${String(mappedRow.external_id).trim()}`;
  } else if (dedupeMode === "email_or_phone") {
    if (mappedRow.email) {
      lookupKey = `email:${String(mappedRow.email).toLowerCase().trim()}`;
    } else if (mappedRow.phone) {
      lookupKey = `phone:${String(mappedRow.phone).trim()}`;
    }
  }

  if (!lookupKey) {
    return { existingLead: null, shouldUpdate: false };
  }

  const existingLead = existingLeadsMap.get(lookupKey) || null;

  return {
    existingLead,
    shouldUpdate: !!existingLead,
  };
}

export function mergeLeadData(
  existing: Lead,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = {
    id: existing.id,
    tenant_id: existing.tenant_id,
    campaign_id: existing.campaign_id,
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
    const incomingValue = incoming[field];
    const existingValue = existing[field as keyof Lead];

    if (incomingValue !== undefined && incomingValue !== null && incomingValue !== "") {
      merged[field] = incomingValue;
    } else if (existingValue !== undefined && existingValue !== null) {
      merged[field] = existingValue;
    }
  }

  const existingCustomFields = (existing.custom_fields as Record<string, unknown>) || {};
  const incomingCustomFields: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(incoming)) {
    if (key.startsWith("custom.")) {
      const fieldKey = key.replace("custom.", "");
      if (value !== undefined && value !== null && value !== "") {
        incomingCustomFields[fieldKey] = value;
      }
    }
  }

  merged.custom_fields = {
    ...existingCustomFields,
    ...incomingCustomFields,
  };

  return merged;
}

