"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { UpdateTemplate } from "@/lib/data/adminTemplates";

interface TemplateManagerProps {
  tenantId: string;
  templates: UpdateTemplate[];
}

export default function TemplateManager({ tenantId, templates }: TemplateManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [updateType, setUpdateType] = useState<"call_attempt" | "note">("note");
  const [defaultCallOutcome, setDefaultCallOutcome] = useState<"reached" | "not_reached" | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sortOrder = templates.length > 0 ? Math.max(...templates.map((t) => t.sort_order)) + 1 : 0;

      const response = await fetch(`/api/admin/tenants/${tenantId}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          update_type: updateType,
          default_call_outcome: updateType === "call_attempt" ? defaultCallOutcome : null,
          comment: comment || null,
          sort_order: sortOrder,
        }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to create template");

      router.refresh();
      setName("");
      setUpdateType("note");
      setDefaultCallOutcome(null);
      setComment("");
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (templateId: string, currentActive: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/templates/${templateId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !currentActive }),
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to update template");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/templates/${templateId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to delete template");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Update Templates</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover sm:text-sm"
        >
          {isCreating ? "Cancel" : "Add Template"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value as "call_attempt" | "note")}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            >
              <option value="note">Note</option>
              <option value="call_attempt">Call Attempt</option>
            </select>
          </div>
          {updateType === "call_attempt" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Call Outcome
              </label>
              <select
                value={defaultCallOutcome || ""}
                onChange={(e) =>
                  setDefaultCallOutcome(
                    e.target.value ? (e.target.value as "reached" | "not_reached") : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
              >
                <option value="">None</option>
                <option value="reached">Reached</option>
                <option value="not_reached">Not Reached</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
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
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
          >
            <div>
              <span className="font-medium text-gray-900">{template.name}</span>
              <span className="ml-2 text-sm text-gray-500">({template.update_type})</span>
              {!template.is_active && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(template.id, template.is_active)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                {template.is_active ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => handleDelete(template.id)}
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

