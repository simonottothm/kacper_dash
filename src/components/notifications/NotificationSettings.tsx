"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { NotificationPreferences } from "@/lib/data/notifications";

interface NotificationSettingsProps {
  tenantId: string;
}

export default function NotificationSettings({ tenantId }: NotificationSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/prefs?tenantId=${tenantId}`);
      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to load preferences");
      }

      setPrefs(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadPreferences();
  }, [tenantId, loadPreferences]);

  const handleSave = async () => {
    if (!prefs) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications/prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: prefs.tenant_id,
          emailNewUpdates: prefs.email_new_updates,
          emailOverdueFollowups: prefs.email_overdue_followups,
          digestFrequency: prefs.digest_frequency,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to save preferences");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading preferences...</p>
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="rounded-xl bg-red-50 p-3">
        <p className="text-sm text-red-800">Failed to load preferences</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Email Notifications</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-app rounded-xl bg-card">
            <div>
              <label className="font-medium text-[var(--text)]">New Updates</label>
              <p className="text-sm text-muted mt-1">
                Receive emails when leads in your campaigns are updated
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.email_new_updates}
                onChange={(e) =>
                  setPrefs({ ...prefs, email_new_updates: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--bg)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-app rounded-xl bg-card">
            <div>
              <label className="font-medium text-[var(--text)]">Overdue Follow-ups</label>
              <p className="text-sm text-muted mt-1">
                Receive emails when leads have overdue follow-up dates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.email_overdue_followups}
                onChange={(e) =>
                  setPrefs({ ...prefs, email_overdue_followups: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--bg)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-app after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="p-4 border border-app rounded-xl bg-card">
            <label className="block text-xs font-medium text-muted mb-2 uppercase tracking-wide">Digest Frequency</label>
            <select
              value={prefs.digest_frequency}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  digest_frequency: e.target.value as "daily" | "weekly" | "immediate",
                })
              }
              className="w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="immediate" disabled>
                Immediate (coming soon)
              </option>
            </select>
            <p className="text-sm text-muted mt-2">
              How often to receive email digests
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

