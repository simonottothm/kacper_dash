"use client";

import type { CSVRow } from "@/lib/import/csv";

interface ImportPreviewProps {
  headers: string[];
  rows: CSVRow[];
  maxRows?: number;
}

export default function ImportPreview({
  headers,
  rows,
  maxRows = 10,
}: ImportPreviewProps) {
  const previewRows = rows.slice(0, maxRows);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          CSV Preview ({rows.length} total rows)
        </h3>
        <p className="text-xs text-gray-500">
          Showing first {Math.min(maxRows, rows.length)} rows
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewRows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {headers.map((header, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap"
                  >
                    {row[header] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

