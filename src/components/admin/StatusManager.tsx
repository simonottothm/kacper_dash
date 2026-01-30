"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { StatusDefinition } from "@/lib/data/adminStatus";

interface StatusManagerProps {
  tenantId: string;
  statuses: StatusDefinition[];
}

export default function StatusManager({ tenantId, statuses }: StatusManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sortOrder = statuses.length > 0 ? Math.max(...statuses.map((s) => s.sort_order)) + 1 : 0;

      const response = await fetch(`/api/admin/tenants/${tenantId}/statuses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          sort_order: sortOrder,
          is_default: isDefault,
          is_closed: isClosed,
        }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to create status");

      router.refresh();
      setLabel("");
      setIsDefault(false);
      setIsClosed(false);
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (statusId: string) => {
    if (!confirm("Are you sure you want to delete this status?")) return;

    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/statuses/${statusId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to delete status");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleSetDefault = async (statusId: string) => {
    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/statuses/${statusId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_default: true }),
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to update status");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Status Pipeline</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover sm:text-sm"
        >
          {isCreating ? "Cancel" : "Add Status"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Default Status</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isClosed}
                onChange={(e) => setIsClosed(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Closed Status</span>
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 sm:text-sm"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {statuses.map((status) => (
          <div
            key={status.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
          >
            <div>
              <span className="font-medium text-gray-900">{status.label}</span>
              {status.is_default && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                  Default
                </span>
              )}
              {status.is_closed && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  Closed
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!status.is_default && (
                <button
                  onClick={() => handleSetDefault(status.id)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Set Default
                </button>
              )}
              <button
                onClick={() => handleDelete(status.id)}
                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

