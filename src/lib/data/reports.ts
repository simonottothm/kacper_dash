import { createClient } from "@/lib/supabase/server";

export interface StatusCount {
  statusId: string | null;
  label: string;
  count: number;
}

export interface WeeklyActivity {
  weekStart: string;
  count: number;
}

export interface CampaignReport {
  byStatus: StatusCount[];
  weeklyActivity: WeeklyActivity[];
  callOutcomes: {
    reached: number;
    not_reached: number;
  };
  aging: {
    noUpdate14d: number;
    noUpdate30d: number;
  };
}

export async function getCampaignReport(campaignId: string): Promise<CampaignReport> {
  const supabase = await createClient();

  const { data: leadsData, error: leadsError } = await supabase
    .from("leads")
    .select("id, status_id")
    .eq("campaign_id", campaignId)
    .eq("is_archived", false);

  const leads = (leadsData || []) as any[];

  if (leadsError) {
    throw new Error(`Failed to fetch leads: ${leadsError.message}`);
  }

  const statusIds = new Set<string | null>();
  for (const lead of leads || []) {
    statusIds.add(lead.status_id || null);
  }

  const { data: statuses } = await supabase
    .from("status_definitions")
    .select("id, label")
    .in("id", Array.from(statusIds).filter((id): id is string => id !== null));

  const statusMap = new Map(
    ((statuses as any[]) || []).map((s) => [s.id, s.label])
  );

  const statusCounts = new Map<string | null, number>();
  for (const lead of leads || []) {
    const statusId = lead.status_id || null;
    statusCounts.set(statusId, (statusCounts.get(statusId) || 0) + 1);
  }

  const byStatus: StatusCount[] = Array.from(statusCounts.entries()).map(([statusId, count]) => ({
    statusId,
    label: statusId ? statusMap.get(statusId) || "Unknown" : "No Status",
    count,
  }));

  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const leadIds = (leads || []).map((l) => l.id);

  if (leadIds.length === 0) {
    return {
      byStatus,
      weeklyActivity: [],
      callOutcomes: { reached: 0, not_reached: 0 },
      aging: { noUpdate14d: 0, noUpdate30d: 0 },
    };
  }

  const { data: updatesData, error: updatesError } = await supabase
    .from("lead_updates")
    .select("created_at")
    .in("lead_id", leadIds)
    .gte("created_at", eightWeeksAgo.toISOString());

  const updates = (updatesData || []) as any[];

  if (updatesError) {
    throw new Error(`Failed to fetch updates: ${updatesError.message}`);
  }

  const weeklyMap = new Map<string, number>();
  for (const update of updates || []) {
    const date = new Date(update.created_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekKey = weekStart.toISOString().split("T")[0];

    weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1);
  }

  const weeklyActivity: WeeklyActivity[] = Array.from(weeklyMap.entries())
    .map(([weekStart, count]) => ({ weekStart, count }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    .slice(-8);

  const { data: callAttemptsData, error: callError } = await supabase
    .from("lead_updates")
    .select("call_outcome")
    .eq("update_type", "call_attempt")
    .in("lead_id", leadIds);

  const callAttempts = (callAttemptsData || []) as any[];

  if (callError) {
    throw new Error(`Failed to fetch call attempts: ${callError.message}`);
  }

  const callOutcomes = {
    reached: 0,
    not_reached: 0,
  };

  for (const attempt of callAttempts || []) {
    if (attempt.call_outcome === "reached") {
      callOutcomes.reached++;
    } else if (attempt.call_outcome === "not_reached") {
      callOutcomes.not_reached++;
    }
  }

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);


  const { data: lastUpdatesData, error: lastUpdatesError } = await supabase
    .from("lead_updates")
    .select("lead_id, created_at")
    .in("lead_id", leadIds)
    .order("created_at", { ascending: false });

  const lastUpdates = (lastUpdatesData || []) as any[];

  if (lastUpdatesError) {
    throw new Error(`Failed to fetch last updates: ${lastUpdatesError.message}`);
  }

  const leadLastUpdate = new Map<string, Date>();
  for (const update of lastUpdates || []) {
    if (!leadLastUpdate.has(update.lead_id)) {
      leadLastUpdate.set(update.lead_id, new Date(update.created_at));
    }
  }

  let noUpdate14d = 0;
  let noUpdate30d = 0;

  for (const leadId of leadIds) {
    const lastUpdate = leadLastUpdate.get(leadId);
    if (!lastUpdate) {
      noUpdate14d++;
      noUpdate30d++;
    } else {
      if (lastUpdate < fourteenDaysAgo) {
        noUpdate14d++;
      }
      if (lastUpdate < thirtyDaysAgo) {
        noUpdate30d++;
      }
    }
  }

  return {
    byStatus,
    weeklyActivity,
    callOutcomes,
    aging: {
      noUpdate14d,
      noUpdate30d,
    },
  };
}

