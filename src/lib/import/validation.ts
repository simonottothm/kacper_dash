import type { StatusDefinition } from "@/lib/data/adminStatus";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidatedRow {
  data: Record<string, unknown>;
  errors: ValidationError[];
}

export function validateEmail(email: string | unknown): boolean {
  if (typeof email !== "string" || !email) {
    return true;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string | unknown): boolean {
  if (typeof phone !== "string" || !phone) {
    return true;
  }
  return phone.replace(/\D/g, "").length >= 7;
}

export function validateStatusLabel(
  label: string | unknown,
  statuses: StatusDefinition[]
): boolean {
  if (typeof label !== "string" || !label) {
    return true;
  }
  return statuses.some((s) => s.label.toLowerCase() === label.toLowerCase());
}

export function validateCustomField(
  value: unknown,
  field: CustomFieldDefinition
): boolean {
  if (value === null || value === undefined || value === "") {
    return true;
  }

  if (field.field_type === "number") {
    return !isNaN(Number(value));
  }

  if (field.field_type === "select") {
    if (!field.options || field.options.length === 0) {
      return true;
    }
    return field.options.includes(String(value));
  }

  return true;
}

export function validateRow(
  mappedRow: Record<string, unknown>,
  statuses: StatusDefinition[],
  customFields: CustomFieldDefinition[]
): ValidatedRow {
  const errors: ValidationError[] = [];

  if (mappedRow.email && !validateEmail(mappedRow.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (mappedRow.phone && !validatePhone(mappedRow.phone)) {
    errors.push({ field: "phone", message: "Invalid phone format" });
  }

  if (mappedRow.status_label) {
    if (!validateStatusLabel(mappedRow.status_label, statuses)) {
      errors.push({
        field: "status_label",
        message: `Status "${mappedRow.status_label}" not found`,
      });
    }
  }

  for (const [key, value] of Object.entries(mappedRow)) {
    if (key.startsWith("custom.")) {
      const fieldKey = key.replace("custom.", "");
      const customField = customFields.find((f) => f.field_key === fieldKey);
      if (customField && !validateCustomField(value, customField)) {
        errors.push({
          field: key,
          message: `Invalid value for ${customField.label}`,
        });
      }
    }
  }

  return {
    data: mappedRow,
    errors,
  };
}

export function parseNextFollowUp(value: unknown): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

