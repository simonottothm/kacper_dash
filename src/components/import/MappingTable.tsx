"use client";

import { useState } from "react";
import type { MappedField } from "@/lib/import/mapping";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";

interface MappingTableProps {
  headers: string[];
  mapping: Record<string, MappedField>;
  onMappingChange: (header: string, field: MappedField) => void;
  customFields: CustomFieldDefinition[];
}

export default function MappingTable({
  headers,
  mapping,
  onMappingChange,
  customFields,
}: MappingTableProps) {
  const availableFields: Array<{ value: MappedField; label: string }> = [
    { value: "ignore", label: "Ignore" },
    { value: "full_name", label: "Full Name" },
    { value: "company", label: "Company" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "external_id", label: "External ID" },
    { value: "status_label", label: "Status (by label)" },
    { value: "next_follow_up_at", label: "Next Follow-up" },
    ...customFields.map((field) => ({
      value: `custom.${field.field_key}` as MappedField,
      label: `Custom: ${field.label}`,
    })),
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Map CSV Columns to Lead Fields</h3>
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                CSV Column
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Map To
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {headers.map((header) => (
              <tr key={header}>
                <td className="px-4 py-3 text-sm text-gray-900">{header}</td>
                <td className="px-4 py-3">
                  <select
                    value={mapping[header] || "ignore"}
                    onChange={(e) =>
                      onMappingChange(header, e.target.value as MappedField)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {availableFields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

