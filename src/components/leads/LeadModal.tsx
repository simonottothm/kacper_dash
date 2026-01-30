"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Lead } from "@/lib/data/leads";
import type { LeadUpdate } from "@/lib/data/leadUpdates";
import type { StatusDefinition } from "@/lib/data/leads";
import UpdatesTimeline from "./UpdatesTimeline";
import UpdateComposer from "./UpdateComposer";

interface LeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  statuses: StatusDefinition[];
  campaignId?: string;
}

export default function LeadModal({
  lead,
  isOpen,
  onClose,
  statuses,
  campaignId,
}: LeadModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusId, setStatusId] = useState<string>("");
  const [followUpAt, setFollowUpAt] = useState<string>("");
  const [updates, setUpdates] = useState<LeadUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingFollowup, setSavingFollowup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setStatusId(lead.status_id || "");
      setFollowUpAt(
        lead.next_follow_up_at
          ? new Date(lead.next_follow_up_at).toISOString().slice(0, 16)
          : ""
      );
      setUpdates([]);
      setError(null);
      if (isOpen) {
        loadUpdates();
      }
    }
  }, [lead, isOpen]);

  const loadUpdates = async () => {
    if (!lead) return;

    setLoadingUpdates(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/updates`);
      const data = await response.json();

      if (data.ok) {
        setUpdates(data.data.updates);
      } else {
        setError(data.error?.message || "Failed to load updates");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load updates");
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    if (!lead || savingStatus) return;

    setSavingStatus(true);
    setError(null);

    try {
      const response = await fetch(`/api/leads/${lead.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statusId: newStatusId || null,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to update status");
      }

      setStatusId(newStatusId);
      await loadUpdates();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      setSavingStatus(false);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleFollowupChange = async () => {
    if (!lead || savingFollowup) return;

    setSavingFollowup(true);
    setError(null);

    try {
      const nextFollowUpAt = followUpAt
        ? new Date(followUpAt).toISOString()
        : null;

      const response = await fetch(`/api/leads/${lead.id}/followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextFollowUpAt,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to update follow-up");
      }

      await loadUpdates();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update follow-up");
    } finally {
      setSavingFollowup(false);
    }
  };

  const handleUpdateSuccess = () => {
    loadUpdates();
    router.refresh();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) {
    return null;
  }

  const statusLabels = statuses.reduce(
    (acc, status) => {
      acc[status.id] = status.label;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-card border border-app rounded-2xl shadow-app-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-card border-b border-app px-6 py-4 flex justify-between items-center z-10">
            <h2 id="modal-title" className="text-xl font-semibold text-[var(--text)]">
              Lead Details
            </h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-accent rounded-xl p-1 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                  Full Name
                </label>
                <p className="text-sm text-[var(--text)] font-medium">{lead.full_name || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                  Company
                </label>
                <p className="text-sm text-[var(--text)]">{lead.company || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                  Email
                </label>
                <p className="text-sm text-[var(--text)]">{lead.email || "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wide">
                  Phone
                </label>
                <p className="text-sm text-[var(--text)]">{lead.phone || "—"}</p>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="border-t border-app pt-6 space-y-6">
              <div>
                <label
                  htmlFor="status-select"
                  className="block text-xs font-medium text-muted mb-2 uppercase tracking-wide"
                >
                  Status
                </label>
                <select
                  id="status-select"
                  value={statusId}
                  onChange={(e) => {
                    const newStatusId = e.target.value;
                    setStatusId(newStatusId);
                    handleStatusChange(newStatusId);
                  }}
                  disabled={savingStatus}
                  className="w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm disabled:opacity-50"
                >
                  <option value="">No Status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="followup-input"
                  className="block text-xs font-medium text-muted mb-2 uppercase tracking-wide"
                >
                  Next Follow-up
                </label>
                <div className="flex gap-2">
                  <input
                    id="followup-input"
                    type="datetime-local"
                    value={followUpAt}
                    onChange={(e) => setFollowUpAt(e.target.value)}
                    className="flex-1 px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleFollowupChange}
                    disabled={savingFollowup}
                    className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    {savingFollowup ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-app pt-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Add Update
              </h3>
              <UpdateComposer leadId={lead.id} onSuccess={handleUpdateSuccess} />
            </div>

            <div className="border-t border-app pt-6">
              <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
                Timeline
              </h3>
              {loadingUpdates ? (
                <div className="text-center py-8 text-muted text-sm">
                  Loading updates...
                </div>
              ) : (
                <UpdatesTimeline updates={updates} statusLabels={statusLabels} />
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-card border-t border-app px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-app rounded-xl text-sm font-medium text-[var(--text)] bg-card hover:bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
