"use client";

import { useState } from "react";
import StatsCard from "./StatsCard";
import ActivityFeed from "@/components/activity/ActivityFeed";
import ReportsPanel from "@/components/reports/ReportsPanel";

interface SecondaryColumnProps {
  campaignId: string;
}

export default function SecondaryColumn({ campaignId }: SecondaryColumnProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "stats" | "reports">("activity");

  return (
    <div className="bg-card border border-app rounded-2xl shadow-app overflow-hidden min-w-0">
      <div className="flex border-b border-app overflow-x-auto">
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
            activeTab === "activity"
              ? "text-accent border-b-2 border-accent"
              : "text-muted hover:text-[var(--text)]"
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
            activeTab === "stats"
              ? "text-accent border-b-2 border-accent"
              : "text-muted hover:text-[var(--text)]"
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
            activeTab === "reports"
              ? "text-accent border-b-2 border-accent"
              : "text-muted hover:text-[var(--text)]"
          }`}
        >
          Reports
        </button>
      </div>

      <div className="p-4 sm:p-5 max-h-[calc(100vh-300px)] overflow-y-auto">
        {activeTab === "activity" && (
          <ActivityFeed campaignId={campaignId} limit={20} />
        )}
        {activeTab === "stats" && (
          <StatsCard campaignId={campaignId} />
        )}
        {activeTab === "reports" && (
          <ReportsPanel campaignId={campaignId} />
        )}
      </div>
    </div>
  );
}

