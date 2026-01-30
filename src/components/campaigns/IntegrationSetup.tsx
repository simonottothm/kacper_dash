"use client";

import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";

interface IntegrationSetupProps {
  campaignId: string;
  tenantId: string;
  customFields: CustomFieldDefinition[];
}

function CopyButton({ text }: { text: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="px-3 py-1.5 border border-app rounded-lg text-xs font-medium text-[var(--text)] bg-card hover:bg-[var(--bg)] transition-colors"
    >
      Copy
    </button>
  );
}

export default function IntegrationSetup({
  campaignId,
  tenantId,
  customFields,
}: IntegrationSetupProps) {
  const endpoint = "/api/leads/upsert";
  const payload = {
    tenantId,
    campaignId,
    fullName: "Jane Doe",
    company: "Acme Inc",
    email: "jane@acme.com",
    phone: "+1 555-1234",
    status: "Interested",
    nextFollowUpAt: "2024-04-20T09:00:00.000Z",
    customFields: {
      example_field: "Value",
    },
  };

  const customKeys = customFields.map((field) => `customFields.${field.field_key || field.key}`);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">Integration Setup</h2>
        <p className="text-sm text-muted">
          Use Make.com or any HTTP client to send leads into this campaign.
        </p>
      </div>

      <div className="bg-card border border-app rounded-2xl shadow-app p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted mb-1">Endpoint</div>
            <div className="text-sm text-[var(--text)] font-medium">POST {endpoint}</div>
          </div>
          <CopyButton text={endpoint} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted mb-1">Header</div>
            <div className="text-sm text-[var(--text)] font-medium">x-api-key: &lt;your-key&gt;</div>
          </div>
          <CopyButton text="x-api-key: <your-key>" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted mb-1">Campaign ID</div>
            <div className="text-sm text-[var(--text)] font-medium">{campaignId}</div>
          </div>
          <CopyButton text={campaignId} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted mb-1">Tenant ID</div>
            <div className="text-sm text-[var(--text)] font-medium">{tenantId}</div>
          </div>
          <CopyButton text={tenantId} />
        </div>
      </div>

      <div className="bg-card border border-app rounded-2xl shadow-app p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)]">Example Payload</h3>
          <CopyButton text={JSON.stringify(payload, null, 2)} />
        </div>
        <pre className="text-xs text-muted bg-[var(--bg)] rounded-xl p-4 overflow-x-auto">
{JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      <div className="bg-card border border-app rounded-2xl shadow-app p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text)]">Supported Field Keys</h3>
        <div className="text-sm text-muted">
          <div>Standard: fullName, company, email, phone, externalId, nextFollowUpAt, status</div>
          {customKeys.length > 0 && (
            <div>Custom: {customKeys.join(", ")}</div>
          )}
          {customKeys.length === 0 && <div>Custom: (keine definiert)</div>}
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          API keys werden nur im Admin-Bereich verwaltet. Bitte Admin für den x-api-key fragen.
        </div>
      </div>
    </div>
  );
}

