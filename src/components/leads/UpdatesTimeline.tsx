"use client";

import type { LeadUpdate } from "@/lib/data/leadUpdates";

interface UpdatesTimelineProps {
  updates: LeadUpdate[];
  statusLabels?: Record<string, string>;
}

export default function UpdatesTimeline({
  updates,
  statusLabels = {},
}: UpdatesTimelineProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getUpdateLabel = (update: LeadUpdate) => {
    switch (update.update_type) {
      case "call_attempt":
        return "Call Attempt";
      case "note":
        return "Note";
      case "status_change":
        return "Status Changed";
      case "follow_up":
        return "Follow-up Set";
      default:
        return "Update";
    }
  };

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return null;

    if (outcome === "reached") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          Reached
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        Not Reached
      </span>
    );
  };

  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        No updates yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <div
          key={update.id}
          className="border-l-2 border-app pl-4 pb-4 last:pb-0"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium text-[var(--text)]">
                  {getUpdateLabel(update)}
                </span>
                {update.update_type === "call_attempt" &&
                  getOutcomeBadge(update.call_outcome)}
                {update.update_type === "status_change" && (
                  <span className="text-xs text-muted">
                    {update.from_status_id
                      ? `${statusLabels[update.from_status_id] || "Unknown"} → `
                      : ""}
                    {update.to_status_id
                      ? statusLabels[update.to_status_id] || "Unknown"
                      : "None"}
                  </span>
                )}
                {update.update_type === "follow_up" && update.follow_up_at && (
                  <span className="text-xs text-muted">
                    {formatDate(update.follow_up_at)}
                  </span>
                )}
              </div>
              {update.comment && (
                <p className="text-sm text-muted mt-1.5 whitespace-pre-wrap">
                  {update.comment}
                </p>
              )}
              <p className="text-xs text-muted mt-1.5">
                {formatDate(update.created_at)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

