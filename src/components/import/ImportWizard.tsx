"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseCSV, previewCSV, type CSVRow } from "@/lib/import/csv";
import type { MappedField } from "@/lib/import/mapping";
import { validateMapping } from "@/lib/import/mapping";
import ImportPreview from "./ImportPreview";
import MappingTable from "./MappingTable";
import ImportResult from "./ImportResult";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";
import type { DedupeMode } from "@/lib/import/dedupe";

interface ImportWizardProps {
  tenantId: string;
  campaignId: string;
  customFields: CustomFieldDefinition[];
  onClose: () => void;
}

type WizardStep = "upload" | "preview" | "mapping" | "importing" | "result";

export default function ImportWizard({
  tenantId,
  campaignId,
  customFields,
  onClose,
}: ImportWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CSVRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, MappedField>>({});
  const [dedupeMode, setDedupeMode] = useState<DedupeMode>("email_or_phone");
  const [defaultStatusLabel, setDefaultStatusLabel] = useState("");
  const [onError, setOnError] = useState<"skip_row" | "fail_import">("skip_row");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    stats: { created: number; updated: number; skipped: number; errorsCount: number };
    errorRows: Array<{ row: number; data: Record<string, unknown>; errors: string[] }>;
  } | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    setFile(selectedFile);
    setError(null);

    const text = await selectedFile.text();
    setCsvText(text);

    const preview = previewCSV(text, 10);
    setHeaders(preview.headers);
    setRows(preview.rows);

    const initialMapping: Record<string, MappedField> = {};
    preview.headers.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes("name") && !lowerHeader.includes("company")) {
        initialMapping[header] = "full_name";
      } else if (lowerHeader.includes("company")) {
        initialMapping[header] = "company";
      } else if (lowerHeader.includes("email")) {
        initialMapping[header] = "email";
      } else if (lowerHeader.includes("phone")) {
        initialMapping[header] = "phone";
      } else {
        initialMapping[header] = "ignore";
      }
    });
    setMapping(initialMapping);

    setStep("preview");
  };

  const handleMappingChange = (header: string, field: MappedField) => {
    setMapping((prev) => ({ ...prev, [header]: field }));
  };

  const handleNext = () => {
    if (step === "preview") {
      const validation = validateMapping(mapping, headers, customFields);
      if (!validation.valid) {
        setError(validation.errors.join(", "));
        return;
      }
      setStep("mapping");
    } else if (step === "mapping") {
      setStep("importing");
      handleImport();
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/campaigns/${campaignId}/imports`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file?.name || "import.csv",
            csvText,
            mapping,
            dedupeMode,
            defaultStatusLabel: defaultStatusLabel || undefined,
            onError,
          }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Import failed");
      }

      setImportResult({
        stats: data.data.stats,
        errorRows: [],
      });

      if (data.data.errorsCount > 0) {
        const detailResponse = await fetch(`/api/admin/imports/${data.data.importId}`);
        const detailData = await detailResponse.json();
        if (detailData.ok) {
          setImportResult({
            stats: data.data.stats,
            errorRows: detailData.data.errorRows || [],
          });
        }
      }

      setStep("result");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStep("mapping");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-semibold text-gray-900">Import CSV</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4 space-y-6">
            {step === "upload" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
                  </p>
                </div>
                {error && (
                  <div className="rounded-xl bg-red-50 p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            )}

            {step === "preview" && (
              <div className="space-y-4">
                <ImportPreview headers={headers} rows={rows} />
                {error && (
                  <div className="rounded-xl bg-red-50 p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            )}

            {step === "mapping" && (
              <div className="space-y-4">
                <MappingTable
                  headers={headers}
                  mapping={mapping}
                  onMappingChange={handleMappingChange}
                  customFields={customFields}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deduplication Mode
                    </label>
                    <select
                      value={dedupeMode}
                      onChange={(e) => setDedupeMode(e.target.value as DedupeMode)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
                    >
                      <option value="email_or_phone">Email or Phone</option>
                      <option value="external_id">External ID</option>
                      <option value="none">None (Always Insert)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Status (optional)
                    </label>
                    <input
                      type="text"
                      value={defaultStatusLabel}
                      onChange={(e) => setDefaultStatusLabel(e.target.value)}
                      placeholder="e.g., Neu"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      On Error
                    </label>
                    <select
                      value={onError}
                      onChange={(e) => setOnError(e.target.value as "skip_row" | "fail_import")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
                    >
                      <option value="skip_row">Skip Row</option>
                      <option value="fail_import">Fail Import</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>
            )}

            {step === "importing" && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Importing leads...</p>
              </div>
            )}

            {step === "result" && importResult && (
              <ImportResult stats={importResult.stats} errorRows={importResult.errorRows} />
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
            {step !== "result" && step !== "importing" && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 sm:text-sm"
                >
                  Cancel
                </button>
                {step !== "upload" && (
                  <button
                    onClick={() => setStep(step === "mapping" ? "preview" : "upload")}
                    className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 sm:text-sm"
                  >
                    Back
                  </button>
                )}
                {step !== "mapping" && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 sm:text-sm"
                  >
                    Next
                  </button>
                )}
                {step === "mapping" && (
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 sm:text-sm"
                  >
                    Import
                  </button>
                )}
              </>
            )}
            {step === "result" && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 sm:text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

