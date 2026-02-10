import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import { getResendClient, getEmailFrom } from "@/lib/email/resend";
import { renderDigestEmail, type DigestData } from "@/lib/email/templates/digest";
import { listUsersForDigest } from "@/lib/data/notifications";
import {
  getUserTenantStateWithService,
  upsertUserTenantStateWithService,
} from "@/lib/data/userState";
import { getRequestId } from "@/lib/security/requestId";
import { checkRateLimit, getRateLimitKey } from "@/lib/security/rateLimit";
import { ok, badRequest, unauthorized, serverError, tooManyRequests } from "@/lib/http/apiResponse";
import { z } from "zod";

const postSchema = z.object({
  mode: z.enum(["daily", "weekly"]),
});

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const cronSecret = request.headers.get("x-cron-secret");
    const token = new URL(request.url).searchParams.get("token");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || (cronSecret !== expectedSecret && token !== expectedSecret)) {
      console.error(`[${requestId}] Invalid cron secret attempt`);
      return unauthorized("Invalid cron secret", requestId);
    }

    const rateLimitKey = getRateLimitKey("cron-digest", "cron");
    const rateLimitResult = checkRateLimit(rateLimitKey, 10);

    if (!rateLimitResult.allowed) {
      return tooManyRequests("Rate limit exceeded", requestId);
    }

    const url = new URL(request.url);
    const modeFromQuery = url.searchParams.get("mode");
    let body: { mode?: string } = {};

    if (!modeFromQuery) {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    } else {
      body = { mode: modeFromQuery };
    }

    const validated = postSchema.parse(body);

    const serviceClient = getServiceClient();
    const resend = getResendClient();
    const emailFrom = getEmailFrom();

    const { data: tenants } = await serviceClient
      .from("tenants")
      .select("id, name");

    if (!tenants || tenants.length === 0) {
      return NextResponse.json({
        ok: true,
        data: { scannedUsers: 0, sent: 0, skipped: 0 },
      });
    }

    let scannedUsers = 0;
    let sent = 0;
    let skipped = 0;

    for (const tenant of tenants) {
      const users = await listUsersForDigest(tenant.id, validated.mode, serviceClient);

      for (const user of users) {
        scannedUsers++;

        const prefs = await getUserTenantStateWithService(serviceClient, tenant.id, user.user_id);
        const lastDigestSent = prefs?.last_digest_sent_at
          ? new Date(prefs.last_digest_sent_at)
          : null;

        const now = new Date();
        const shouldSend =
          !lastDigestSent ||
          (validated.mode === "daily" &&
            now.getTime() - lastDigestSent.getTime() >= 24 * 60 * 60 * 1000) ||
          (validated.mode === "weekly" &&
            now.getTime() - lastDigestSent.getTime() >= 7 * 24 * 60 * 60 * 1000);

        if (!shouldSend) {
          skipped++;
          continue;
        }

        const { data: campaigns } = await serviceClient
          .from("campaigns")
          .select("id")
          .eq("tenant_id", tenant.id)
          .eq("is_archived", false);

        const campaignIds = (campaigns || []).map((c) => c.id);

        if (campaignIds.length === 0) {
          skipped++;
          continue;
        }

        const { data: leads } = await serviceClient
          .from("leads")
          .select("id")
          .in("campaign_id", campaignIds)
          .eq("is_archived", false);

        const leadIds = (leads || []).map((l) => l.id);

        if (leadIds.length === 0) {
          skipped++;
          continue;
        }

        const lastSeenAt = prefs?.last_seen_updates_at || new Date(0).toISOString();
        const cutoffDate = lastSeenAt > (lastDigestSent?.toISOString() || "")
          ? lastSeenAt
          : lastDigestSent?.toISOString() || new Date(0).toISOString();

        const { data: updates } = await serviceClient
          .from("lead_updates")
          .select("id, created_at, update_type, call_outcome, comment, lead_id")
          .in("lead_id", leadIds)
          .gt("created_at", cutoffDate)
          .order("created_at", { ascending: false })
          .limit(10);

        const updateLeadIds = (updates || []).map((u) => u.lead_id);
        const { data: leadsData } = await serviceClient
          .from("leads")
          .select("id, full_name, company, campaign_id")
          .in("id", updateLeadIds);

        const { data: campaignsData } = await serviceClient
          .from("campaigns")
          .select("id, name")
          .in("id", Array.from(new Set((leadsData || []).map((l) => l.campaign_id))));

        const leadsMap = new Map((leadsData || []).map((l) => [l.id, l]));
        const campaignsMap = new Map((campaignsData || []).map((c) => [c.id, c]));

        const digestUpdates = (updates || []).map((update) => {
          const lead = leadsMap.get(update.lead_id);
          const campaign = lead ? campaignsMap.get(lead.campaign_id) : null;

          return {
            leadId: update.lead_id,
            leadName: lead?.full_name || null,
            company: lead?.company || null,
            campaignId: lead?.campaign_id || "",
            campaignName: campaign?.name || "",
            updateType: update.update_type,
            updateTime: update.created_at,
            comment: update.comment,
          };
        });

        const nowISO = new Date().toISOString();
        const { data: overdueLeads } = await serviceClient
          .from("leads")
          .select("id, full_name, company, campaign_id, next_follow_up_at")
          .in("id", leadIds)
          .not("next_follow_up_at", "is", null)
          .lt("next_follow_up_at", nowISO)
          .limit(10);

        const overdueCampaignIds = Array.from(
          new Set((overdueLeads || []).map((l) => l.campaign_id))
        );
        const { data: overdueCampaignsData } = await serviceClient
          .from("campaigns")
          .select("id, name")
          .in("id", overdueCampaignIds);

        const overdueCampaignsMap = new Map(
          (overdueCampaignsData || []).map((c) => [c.id, c])
        );

        const digestFollowups = (overdueLeads || []).map((lead) => ({
          leadId: lead.id,
          leadName: lead.full_name,
          company: lead.company,
          campaignId: lead.campaign_id,
          campaignName: overdueCampaignsMap.get(lead.campaign_id)?.name || "",
          followUpAt: lead.next_follow_up_at || "",
        }));

        const digestData: DigestData = {
          tenantName: tenant.name,
          newUpdatesCount: digestUpdates.length,
          newUpdates: digestUpdates,
          overdueFollowupsCount: digestFollowups.length,
          overdueFollowups: digestFollowups,
        };

        if (digestData.newUpdatesCount === 0 && digestData.overdueFollowupsCount === 0) {
          skipped++;
          continue;
        }

        try {
          await resend.emails.send({
            from: emailFrom,
            to: user.email,
            subject: `Kacper Leads Digest - ${tenant.name}`,
            html: renderDigestEmail(digestData),
          });

          await upsertUserTenantStateWithService(serviceClient, tenant.id, user.user_id, {
            last_digest_sent_at: nowISO,
          });

          sent++;
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          skipped++;
        }
      }
    }

    return ok(
      {
        scannedUsers,
        sent,
        skipped,
      },
      requestId
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest("VALIDATION_ERROR", "Invalid request body", error.errors, requestId);
    }

    console.error(`[${requestId}] Cron digest error:`, error instanceof Error ? error.message : error);
    return serverError(
      error instanceof Error ? error.message : "Unknown error",
      requestId
    );
  }
}

