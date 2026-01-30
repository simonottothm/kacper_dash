"use client";

import { useMemo, useState } from "react";
import {
  getDefaultCampaignColumns,
  type CampaignColumnConfig,
} from "@/lib/config/campaignColumns";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";

interface ColumnsSettingsProps {
  campaignId: string;
  tenantId: string;
  initialColumns: CampaignColumnConfig[];
  customFields: CustomFieldDefinition[];
}

function normalizeOrders(columns: CampaignColumnConfig[]) {
  return columns.map((col, idx) => ({ ...col, order: idx + 1 }));
}

function buildColumns(
  initialColumns: CampaignColumnConfig[],
  customFields: CustomFieldDefinition[]
) {
  const initialMap = new Map(initialColumns.map((col) => [col.key, { ...col }]));
  const baseColumns = getDefaultCampaignColumns();

  const merged = baseColumns.map((col) => initialMap.get(col.key) || col);

  const existingKeys = new Set(merged.map((col) => col.key));
  const customColumns = customFields.map((field, index) => {
    const key = `custom_fields.${field.field_key || field.key}`;
    return (
      initialMap.get(key) || {
        key,
        label: field.label,
        visible: false,
        order: baseColumns.length + index + 1,
      }
    );
  });

  const extras = initialColumns.filter((col) => !existingKeys.has(col.key));

  return normalizeOrders([...merged, ...customColumns, ...extras]);
}

export default function ColumnsSettings({
  campaignId,
  tenantId,
  initialColumns,
  customFields,
}: ColumnsSettingsProps) {
  const initialState = useMemo(
    () => buildColumns(initialColumns, customFields),
    [initialColumns, customFields]
  );
  const [columns, setColumns] = useState<CampaignColumnConfig[]>(initialState);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/ui-config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns: normalizeOrders(columns) }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to save columns");
      }

      setStatus("saved");
      setColumns(normalizeOrders(data.data.columns));
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save columns");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setColumns(buildColumns(getDefaultCampaignColumns(), customFields));
    setStatus("idle");
    setError(null);
  };

  const moveColumn = (index: number, direction: "up" | "down") => {
    const next = [...columns];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setColumns(normalizeOrders(next));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Table Columns</h2>
          <p className="text-sm text-muted">
            Choose visible columns, rename labels, and adjust order.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            type="button"
            className="px-3 py-2 border border-app rounded-xl text-sm font-medium text-[var(--text)] bg-card hover:bg-[var(--bg)] transition-colors"
          >
            Reset to default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 text-sm font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="bg-card border border-app rounded-2xl shadow-app overflow-hidden">
        <div className="grid grid-cols-[1fr_160px_110px] gap-2 px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wide border-b border-app">
          <div>Column</div>
          <div>Label</div>
          <div className="text-right">Order</div>
        </div>
        <div className="divide-y divide-app">
          {columns.map((column, index) => (
            <div key={column.key} className="grid grid-cols-[1fr_160px_110px] gap-2 px-5 py-3 items-center">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={(e) => {
                    const next = [...columns];
                    next[index] = { ...column, visible: e.target.checked };
                    setColumns(next);
                  }}
                  className="h-4 w-4 rounded border-app text-accent focus:ring-accent"
                />
                <div className="text-sm text-[var(--text)]">{column.key}</div>
              </div>
              <input
                value={column.label}
                onChange={(e) => {
                  const next = [...columns];
                  next[index] = { ...column, label: e.target.value };
                  setColumns(next);
                }}
                className="w-full px-3 py-2 border border-app rounded-xl text-sm bg-card focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => moveColumn(index, "up")}
                  className="px-2 py-1 border border-app rounded-lg text-xs text-muted hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveColumn(index, "down")}
                  className="px-2 py-1 border border-app rounded-lg text-xs text-muted hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                >
                  Down
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {status === "saved" && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
          Columns saved.
        </div>
      )}
      {status === "error" && error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <p className="text-xs text-muted">
        Tenant: {tenantId}
      </p>
    </div>
  );
}

