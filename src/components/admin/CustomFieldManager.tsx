"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";

interface CustomFieldManagerProps {
  tenantId: string;
  fields: CustomFieldDefinition[];
}

export default function CustomFieldManager({ tenantId, fields }: CustomFieldManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [fieldKey, setFieldKey] = useState("");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<"text" | "number" | "select">("text");
  const [options, setOptions] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sortOrder = fields.length > 0 ? Math.max(...fields.map((f) => f.sort_order)) + 1 : 0;
      const optionsArray =
        fieldType === "select" ? options.split(",").map((o) => o.trim()).filter(Boolean) : null;

      if (fieldType === "select" && (!optionsArray || optionsArray.length === 0)) {
        setError("Options are required for select field type");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/admin/tenants/${tenantId}/custom-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_key: fieldKey,
          label,
          field_type: fieldType,
          options: optionsArray,
          is_pinned: isPinned,
          sort_order: sortOrder,
        }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to create custom field");

      router.refresh();
      setFieldKey("");
      setLabel("");
      setFieldType("text");
      setOptions("");
      setIsPinned(false);
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm("Are you sure you want to delete this custom field?")) return;

    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/custom-fields/${fieldId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to delete custom field");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover sm:text-sm"
        >
          {isCreating ? "Cancel" : "Add Field"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Field Key (snake_case)</label>
            <input
              type="text"
              value={fieldKey}
              onChange={(e) => setFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
              required
              pattern="^[a-z0-9_]+$"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as "text" | "number" | "select")}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
            </select>
          </div>
          {fieldType === "select" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options (comma-separated)
              </label>
              <input
                type="text"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
              />
            </div>
          )}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Pinned</span>
          </label>
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
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
          >
            <div>
              <span className="font-medium text-gray-900">{field.label}</span>
              <span className="ml-2 text-sm text-gray-500">({field.field_key})</span>
              <span className="ml-2 text-sm text-gray-500">{field.field_type}</span>
              {field.is_pinned && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                  Pinned
                </span>
              )}
            </div>
            <button
              onClick={() => handleDelete(field.id)}
              className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

