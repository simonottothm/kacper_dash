import { getAppBaseUrl } from "../resend";

export interface DigestUpdate {
  leadId: string;
  leadName: string | null;
  company: string | null;
  campaignId: string;
  campaignName: string;
  updateType: string;
  updateTime: string;
  comment: string | null;
}

export interface DigestFollowup {
  leadId: string;
  leadName: string | null;
  company: string | null;
  campaignId: string;
  campaignName: string;
  followUpAt: string;
}

export interface DigestData {
  tenantName: string;
  newUpdatesCount: number;
  newUpdates: DigestUpdate[];
  overdueFollowupsCount: number;
  overdueFollowups: DigestFollowup[];
}

export function renderDigestEmail(data: DigestData): string {
  const baseUrl = getAppBaseUrl();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case "call_attempt":
        return "Call";
      case "note":
        return "Note";
      case "status_change":
        return "Status Change";
      case "follow_up":
        return "Follow-up";
      default:
        return "Update";
    }
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Digest - ${data.tenantName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">Kacper Leads Digest</h1>
    <p style="margin: 8px 0 0 0; opacity: 0.9;">${data.tenantName}</p>
  </div>

  <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    ${data.newUpdatesCount > 0 ? `
    <div style="margin-bottom: 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #111827;">New Updates (${data.newUpdatesCount})</h2>
      <div style="background-color: white; border-radius: 6px; padding: 16px; border: 1px solid #e5e7eb;">
        ${data.newUpdates.slice(0, 10).map((update) => `
          <div style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
              <div>
                <strong style="color: #111827;">${update.leadName || "Unnamed Lead"}</strong>
                ${update.company ? `<span style="color: #6b7280; margin-left: 8px;">(${update.company})</span>` : ""}
              </div>
              <span style="font-size: 12px; color: #6b7280;">${formatDate(update.updateTime)}</span>
            </div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
              <span style="display: inline-block; background-color: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-right: 8px;">
                ${getUpdateTypeLabel(update.updateType)}
              </span>
              ${update.campaignName}
            </div>
            ${update.comment ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563;">${update.comment.substring(0, 100)}${update.comment.length > 100 ? "..." : ""}</p>` : ""}
            <a href="${baseUrl}/app/campaigns/${update.campaignId}?leadId=${update.leadId}" style="display: inline-block; margin-top: 8px; color: #4f46e5; text-decoration: none; font-size: 13px; font-weight: 500;">
              View Lead →
            </a>
          </div>
        `).join("")}
        ${data.newUpdatesCount > 10 ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #6b7280; text-align: center;">... and ${data.newUpdatesCount - 10} more updates</p>` : ""}
      </div>
    </div>
    ` : ""}

    ${data.overdueFollowupsCount > 0 ? `
    <div style="margin-bottom: 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #111827;">Overdue Follow-ups (${data.overdueFollowupsCount})</h2>
      <div style="background-color: white; border-radius: 6px; padding: 16px; border: 1px solid #e5e7eb;">
        ${data.overdueFollowups.slice(0, 10).map((followup) => `
          <div style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
              <div>
                <strong style="color: #111827;">${followup.leadName || "Unnamed Lead"}</strong>
                ${followup.company ? `<span style="color: #6b7280; margin-left: 8px;">(${followup.company})</span>` : ""}
              </div>
              <span style="font-size: 12px; color: #dc2626; font-weight: 500;">${formatDate(followup.followUpAt)}</span>
            </div>
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
              ${followup.campaignName}
            </div>
            <a href="${baseUrl}/app/campaigns/${followup.campaignId}?leadId=${followup.leadId}" style="display: inline-block; margin-top: 8px; color: #4f46e5; text-decoration: none; font-size: 13px; font-weight: 500;">
              View Lead →
            </a>
          </div>
        `).join("")}
        ${data.overdueFollowupsCount > 10 ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: #6b7280; text-align: center;">... and ${data.overdueFollowupsCount - 10} more follow-ups</p>` : ""}
      </div>
    </div>
    ` : ""}

    ${data.newUpdatesCount === 0 && data.overdueFollowupsCount === 0 ? `
    <div style="text-align: center; padding: 32px 0;">
      <p style="color: #6b7280; margin: 0;">No new updates or overdue follow-ups.</p>
    </div>
    ` : ""}

    <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
      <a href="${baseUrl}/app" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Open Dashboard
      </a>
    </div>
  </div>

  <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
    <p>You're receiving this because you have email notifications enabled for ${data.tenantName}.</p>
    <p><a href="${baseUrl}/app/settings" style="color: #4f46e5; text-decoration: none;">Manage preferences</a></p>
  </div>
</body>
</html>
  `.trim();
}

