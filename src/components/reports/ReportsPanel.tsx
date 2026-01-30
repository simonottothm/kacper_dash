"use client";

import { useEffect, useState } from "react";
import type { CampaignReport } from "@/lib/data/reports";

interface ReportsPanelProps {
  campaignId: string;
}

export default function ReportsPanel({ campaignId }: ReportsPanelProps) {
  const [report, setReport] = useState<CampaignReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/reports/campaign?campaignId=${campaignId}`);
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error?.message || "Failed to load report");
        }

        setReport(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-3">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Campaign Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Leads by Status</h3>
          <div className="space-y-1">
            {report.byStatus.map((status) => (
              <div key={status.statusId || "null"} className="flex justify-between text-sm">
                <span className="text-gray-600">{status.label}</span>
                <span className="font-medium text-gray-900">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Call Outcomes</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Reached</span>
              <span className="font-medium text-green-600">{report.callOutcomes.reached}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Not Reached</span>
              <span className="font-medium text-red-600">{report.callOutcomes.not_reached}</span>
            </div>
            {report.callOutcomes.reached + report.callOutcomes.not_reached > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {Math.round(
                    (report.callOutcomes.reached /
                      (report.callOutcomes.reached + report.callOutcomes.not_reached)) *
                      100
                  )}
                  % reached
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Aging</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">No update 14+ days</span>
              <span className="font-medium text-yellow-600">{report.aging.noUpdate14d}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">No update 30+ days</span>
              <span className="font-medium text-red-600">{report.aging.noUpdate30d}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Weekly Activity</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {report.weeklyActivity.length === 0 ? (
              <p className="text-xs text-gray-500">No activity in last 8 weeks</p>
            ) : (
              report.weeklyActivity.map((week) => (
                <div key={week.weekStart} className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    {new Date(week.weekStart).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-medium text-gray-900">{week.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

