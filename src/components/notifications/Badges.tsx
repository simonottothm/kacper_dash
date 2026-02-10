"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface BadgesProps {
  tenantId: string;
}

export default function Badges({ tenantId }: BadgesProps) {
  const router = useRouter();
  const [badges, setBadges] = useState({ overdueFollowups: 0, newUpdates: 0 });
  const [loading, setLoading] = useState(true);

  const loadBadges = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications/badges?tenantId=${tenantId}`);
      const data = await response.json();

      if (data.ok) {
        setBadges(data.data);
      }
    } catch (err) {
      console.error("Failed to load badges:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadBadges();
    const interval = setInterval(loadBadges, 30000);
    return () => clearInterval(interval);
  }, [tenantId, loadBadges]);

  const total = badges.overdueFollowups + badges.newUpdates;

  if (loading || total === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {badges.overdueFollowups > 0 && (
        <button
          onClick={() => router.push("/app")}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--text)] bg-accent-light border border-app rounded-xl hover:bg-accent-light/80 transition-colors"
        >
          <span>Overdue</span>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-accent rounded-full">
            {badges.overdueFollowups}
          </span>
        </button>
      )}
      {badges.newUpdates > 0 && (
        <button
          onClick={() => router.push("/app")}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--text)] bg-accent-light border border-app rounded-xl hover:bg-accent-light/80 transition-colors"
        >
          <span>Updates</span>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-accent rounded-full">
            {badges.newUpdates}
          </span>
        </button>
      )}
    </div>
  );
}

