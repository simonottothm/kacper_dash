"use client";

import { useRouter } from "next/navigation";
import type { ActivityItem as ActivityItemType } from "@/lib/data/activity";

interface ActivityItemProps {
  item: ActivityItemType;
  campaignId?: string;
}

export default function ActivityItem({ item, campaignId }: ActivityItemProps) {
  const router = useRouter();

  const handleClick = () => {
    const targetCampaignId = campaignId || item.campaignId;
    const url = `/app/campaigns/${targetCampaignId}?leadId=${item.leadId}`;
    router.push(url);
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case "call_attempt":
        return "Call";
      case "note":
        return "Note";
      case "status_change":
        return "Status";
      case "follow_up":
        return "Follow-up";
      default:
        return "Update";
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case "call_attempt":
        return item.callOutcome === "reached"
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-700 border-red-200";
      case "note":
        return "bg-accent-light text-accent border-accent/30";
      case "status_change":
        return "bg-accent-light text-accent border-accent/30";
      case "follow_up":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-[var(--bg)] text-muted border-app";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      onClick={handleClick}
      className="p-3 border border-app rounded-xl hover:border-accent/50 hover:shadow-app cursor-pointer transition-smooth bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${getTypeColor()}`}>
              {getTypeLabel()}
            </span>
            <span className="text-xs text-muted">{formatDate(item.createdAt)}</span>
          </div>
          <div className="text-sm font-medium text-[var(--text)] mb-1 truncate">
            {item.leadName || "Unnamed Lead"}
            {item.company && <span className="text-muted ml-1 font-normal">({item.company})</span>}
          </div>
          {item.comment && (
            <p className="text-sm text-muted line-clamp-2 mt-1">{item.comment}</p>
          )}
          {!campaignId && (
            <p className="text-xs text-muted mt-1 truncate">{item.campaignName}</p>
          )}
        </div>
      </div>
    </div>
  );
}

