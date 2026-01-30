import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";

export type MappedField =
  | "full_name"
  | "company"
  | "email"
  | "phone"
  | "external_id"
  | "status_label"
  | "next_follow_up_at"
  | `custom.${string}`
  | "ignore";

export interface FieldMapping {
  [csvHeader: string]: MappedField;
}

export function getAvailableFields(
  customFields: CustomFieldDefinition[]
): Array<{ value: MappedField; label: string }> {
  const standardFields: Array<{ value: MappedField; label: string }> = [
    { value: "ignore", label: "Ignore" },
    { value: "full_name", label: "Full Name" },
    { value: "company", label: "Company" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "external_id", label: "External ID" },
    { value: "status_label", label: "Status (by label)" },
    { value: "next_follow_up_at", label: "Next Follow-up" },
  ];

  const customFieldOptions = customFields.map((field) => ({
    value: `custom.${field.field_key}` as MappedField,
    label: `Custom: ${field.label}`,
  }));

  return [...standardFields, ...customFieldOptions];
}

export function validateMapping(
  mapping: FieldMapping,
  csvHeaders: string[],
  customFields: CustomFieldDefinition[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const usedStandardFields = new Set<string>();

  for (const [csvHeader, mappedField] of Object.entries(mapping)) {
    if (!csvHeaders.includes(csvHeader)) {
      errors.push(`CSV header "${csvHeader}" not found in file`);
      continue;
    }

    if (mappedField === "ignore") {
      continue;
    }

    if (mappedField.startsWith("custom.")) {
      const fieldKey = mappedField.replace("custom.", "");
      const customField = customFields.find((f) => f.field_key === fieldKey);
      if (!customField) {
        errors.push(`Custom field "${fieldKey}" not found`);
      }
      continue;
    }

    const standardField = mappedField as
      | "full_name"
      | "company"
      | "email"
      | "phone"
      | "external_id"
      | "status_label"
      | "next_follow_up_at";

    if (usedStandardFields.has(standardField)) {
      errors.push(`Standard field "${standardField}" is mapped multiple times`);
    } else {
      usedStandardFields.add(standardField);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function mapRow(
  csvRow: Record<string, string>,
  mapping: FieldMapping
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  for (const [csvHeader, mappedField] of Object.entries(mapping)) {
    if (mappedField === "ignore") {
      continue;
    }

    const value = csvRow[csvHeader];
    if (value === undefined || value === "") {
      continue;
    }

    mapped[mappedField] = value;
  }

  return mapped;
}

