import { createClient } from "@/lib/supabase/server";

export interface ImportJob {
  id: string;
  tenant_id: string;
  campaign_id: string;
  created_by: string;
  file_name: string;
  mapping: Record<string, string>;
  stats: {
    created: number;
    updated: number;
    skipped: number;
    errorsCount: number;
  };
  error_rows: Array<{
    row: number;
    data: Record<string, unknown>;
    errors: string[];
  }>;
  created_at: string;
}

export async function createImportJob(
  tenantId: string,
  campaignId: string,
  userId: string,
  fileName: string,
  mapping: Record<string, string>,
  stats: ImportJob["stats"],
  errorRows: ImportJob["error_rows"]
): Promise<ImportJob> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("import_jobs")
    .insert({
      tenant_id: tenantId,
      campaign_id: campaignId,
      created_by: userId,
      file_name: fileName,
      mapping,
      stats,
      error_rows: errorRows,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create import job: ${error.message}`);
  }

  return data as ImportJob;
}

export async function listCampaignImportJobs(
  tenantId: string,
  campaignId: string
): Promise<ImportJob[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("import_jobs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch import jobs: ${error.message}`);
  }

  return (data || []) as ImportJob[];
}

export async function getImportJobById(importId: string): Promise<ImportJob | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("import_jobs")
    .select("*")
    .eq("id", importId)
    .single();

  if (error) {
    return null;
  }

  return data as ImportJob;
}

