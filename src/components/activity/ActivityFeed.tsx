"use client";

import { useEffect, useState } from "react";
import ActivityItem from "./ActivityItem";
import type { ActivityItem as ActivityItemType } from "@/lib/data/activity";

interface ActivityFeedProps {
  campaignId?: string;
  limit?: number;
}

export default function ActivityFeed({ campaignId, limit = 20 }: ActivityFeedProps) {
  const [items, setItems] = useState<ActivityItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = campaignId
          ? `/api/activity/campaign?campaignId=${campaignId}&limit=${limit}`
          : `/api/activity/tenant?limit=${limit}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error?.message || "Failed to load activity");
        }

        setItems(data.data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [campaignId, limit]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-sm">Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-3">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ActivityItem key={item.id} item={item} campaignId={campaignId} />
      ))}
    </div>
  );
}

