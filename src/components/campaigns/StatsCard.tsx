"use client";

import { useEffect, useState } from "react";
import type { CampaignReport } from "@/lib/data/reports";

interface StatsCardProps {
  campaignId: string;
}

export default function StatsCard({ campaignId }: StatsCardProps) {
  const [report, setReport] = useState<CampaignReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/campaign?campaignId=${campaignId}`);
        const data = await response.json();
        if (data.ok) {
          setReport(data.data);
        }
      } catch (err) {
        console.error("Failed to load report:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="bg-card border border-app rounded-2xl p-6 shadow-app">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--bg)] rounded w-1/3"></div>
          <div className="h-8 bg-[var(--bg)] rounded"></div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const totalLeads = report.byStatus.reduce((sum, s) => sum + s.count, 0);
  const totalCalls = report.callOutcomes.reached + report.callOutcomes.not_reached;
  const reachRate = totalCalls > 0 
    ? Math.round((report.callOutcomes.reached / totalCalls) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-[var(--text)]">Quick Stats</h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-2xl font-bold text-[var(--text)] mb-1">{totalLeads}</div>
          <div className="text-xs text-muted">Total Leads</div>
        </div>

        {totalCalls > 0 && (
          <div>
            <div className="text-2xl font-bold text-[var(--text)] mb-1">{reachRate}%</div>
            <div className="text-xs text-muted">Call Reach Rate</div>
          </div>
        )}

        {report.aging.noUpdate14d > 0 && (
          <div>
            <div className="text-2xl font-bold text-accent mb-1">{report.aging.noUpdate14d}</div>
            <div className="text-xs text-muted">Needs Attention (14+ days)</div>
          </div>
        )}
      </div>
    </div>
  );
}

