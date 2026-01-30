"use client";

import { useState, FormEvent } from "react";

interface UpdateComposerProps {
  leadId: string;
  onSuccess: () => void;
}

export default function UpdateComposer({ leadId, onSuccess }: UpdateComposerProps) {
  const [type, setType] = useState<"call_attempt" | "note">("note");
  const [callOutcome, setCallOutcome] = useState<"reached" | "not_reached" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (type === "call_attempt" && !callOutcome) {
      setError("Please select a call outcome");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          callOutcome: type === "call_attempt" ? callOutcome : null,
          comment: comment || null,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to create update");
      }

      setComment("");
      setCallOutcome(null);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="update-type"
          className="block text-xs font-medium text-muted mb-2 uppercase tracking-wide"
        >
          Update Type
        </label>
        <select
          id="update-type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as "call_attempt" | "note");
            setCallOutcome(null);
          }}
          className="w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        >
          <option value="note">Note</option>
          <option value="call_attempt">Call Attempt</option>
        </select>
      </div>

      {type === "call_attempt" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Outcome
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="callOutcome"
                value="reached"
                checked={callOutcome === "reached"}
                onChange={() => setCallOutcome("reached")}
                className="mr-2"
              />
              <span className="text-sm text-[var(--text)]">Reached</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="callOutcome"
                value="not_reached"
                checked={callOutcome === "not_reached"}
                onChange={() => setCallOutcome("not_reached")}
                className="mr-2"
              />
              <span className="text-sm text-[var(--text)]">Not Reached</span>
            </label>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="comment"
          className="block text-xs font-medium text-muted mb-2 uppercase tracking-wide"
        >
          Comment {type === "call_attempt" && "(optional)"}
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Enter your note or call details..."
          className="w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
      >
        {loading ? "Saving..." : "Add Update"}
      </button>
    </form>
  );
}

