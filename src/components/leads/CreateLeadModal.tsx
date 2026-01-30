\"use client\";

import { useEffect, useState } from \"react\";
import type { StatusDefinition, Lead } from \"@/lib/data/leads\";
import type { CustomFieldDefinition } from \"@/lib/data/adminCustomFields\";

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  statuses: StatusDefinition[];
  customFields: CustomFieldDefinition[];
  onCreated: (lead: Lead) => void;
}

interface FormState {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  statusId: string;
  nextFollowUpAt: string;
  customFields: Record<string, string>;
}

const emptyForm: FormState = {
  fullName: \"\",
  company: \"\",
  email: \"\",
  phone: \"\",
  statusId: \"\",
  nextFollowUpAt: \"\",
  customFields: {},
};

export default function CreateLeadModal({
  isOpen,
  onClose,
  campaignId,
  statuses,
  customFields,
  onCreated,
}: CreateLeadModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(emptyForm);
      setError(null);
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        campaignId,
        fullName: form.fullName || null,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        statusId: form.statusId || null,
        nextFollowUpAt: form.nextFollowUpAt
          ? new Date(form.nextFollowUpAt).toISOString()
          : null,
        customFields: form.customFields,
      };

      const response = await fetch(\"/api/leads/create\", {
        method: \"POST\",
        headers: { \"Content-Type\": \"application/json\" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || \"Lead konnte nicht erstellt werden\");
      }

      onCreated(data.data.lead);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : \"Lead konnte nicht erstellt werden\");
    } finally {
      setSaving(false);
    }
  };

  const updateCustomField = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value,
      },
    }));
  };

  return (
    <div
      className=\"fixed inset-0 z-50 overflow-y-auto\"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className=\"flex min-h-screen items-center justify-center p-4\">
        <div
          className=\"relative bg-card border border-app rounded-2xl shadow-app-lg max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200\"
          onClick={(e) => e.stopPropagation()}
        >
          <div className=\"px-6 py-4 border-b border-app flex items-center justify-between\">
            <h2 className=\"text-lg font-semibold text-[var(--text)]\">Create Lead</h2>
            <button
              onClick={onClose}
              className=\"text-muted hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-accent rounded-xl p-1 transition-colors\"
              aria-label=\"Close\"
            >
              <svg
                className=\"h-5 w-5\"
                fill=\"none\"
                viewBox=\"0 0 24 24\"
                stroke=\"currentColor\"
              >
                <path
                  strokeLinecap=\"round\"
                  strokeLinejoin=\"round\"
                  strokeWidth={2}
                  d=\"M6 18L18 6M6 6l12 12\"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className=\"p-6 space-y-5\">
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              <div>
                <label className=\"block text-sm font-medium text-muted mb-1\">Full Name</label>
                <input
                  type=\"text\"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-medium text-muted mb-1\">Company</label>
                <input
                  type=\"text\"
                  value={form.company}
                  onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-medium text-muted mb-1\">Email</label>
                <input
                  type=\"email\"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                />
              </div>
              <div>
                <label className=\"block text-sm font-medium text-muted mb-1\">Phone</label>
                <input
                  type=\"tel\"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                />
              </div>
            </div>

            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              <div>
                <label className=\"block text-sm font-medium text-muted mb-1\">Status</label>
                <select
                  value={form.statusId}
                  onChange={(e) => setForm((prev) => ({ ...prev, statusId: e.target.value }))}
                  className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                >
                  <option value=\"\">No Status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className=\"block text-sm font-medium text-muted mb-1\">Next Follow-up</label>
                <input
                  type=\"datetime-local\"
                  value={form.nextFollowUpAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nextFollowUpAt: e.target.value }))
                  }
                  className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                />
              </div>
            </div>

            {customFields.length > 0 && (
              <div className=\"border-t border-app pt-5 space-y-4\">
                <h3 className=\"text-sm font-semibold text-[var(--text)]\">Custom Fields</h3>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  {customFields.map((field) => {
                    const value = form.customFields[field.field_key || field.key] || \"\";
                    if (field.field_type === \"select\" && field.options?.length) {
                      return (
                        <div key={field.id}>
                          <label className=\"block text-sm font-medium text-muted mb-1\">
                            {field.label}
                          </label>
                          <select
                            value={value}
                            onChange={(e) =>
                              updateCustomField(field.field_key || field.key, e.target.value)
                            }
                            className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                          >
                            <option value=\"\">—</option>
                            {(field.options || []).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return (
                      <div key={field.id}>
                        <label className=\"block text-sm font-medium text-muted mb-1\">
                          {field.label}
                        </label>
                        <input
                          type={field.field_type === \"number\" ? \"number\" : \"text\"}
                          value={value}
                          onChange={(e) =>
                            updateCustomField(field.field_key || field.key, e.target.value)
                          }
                          className=\"w-full px-4 py-2 border border-app rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-accent text-sm\"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className=\"rounded-xl bg-red-50 border border-red-200 p-3\">
                <p className=\"text-sm text-red-800\">{error}</p>
              </div>
            )}

            <div className=\"flex justify-end gap-2 pt-2\">
              <button
                type=\"button\"
                onClick={onClose}
                className=\"px-4 py-2 border border-app rounded-xl text-sm font-medium text-[var(--text)] bg-card hover:bg-[var(--bg)] transition-colors\"
              >
                Cancel
              </button>
              <button
                type=\"submit\"
                disabled={saving}
                className=\"px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 text-sm font-medium transition-colors\"
              >
                {saving ? \"Creating...\" : \"Create\"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

