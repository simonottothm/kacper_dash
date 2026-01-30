"use client";

interface ImportResultProps {
  stats: {
    created: number;
    updated: number;
    skipped: number;
    errorsCount: number;
  };
  errorRows?: Array<{
    row: number;
    data: Record<string, unknown>;
    errors: string[];
  }>;
}

export default function ImportResult({ stats, errorRows = [] }: ImportResultProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Complete</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">{stats.created}</div>
            <div className="text-sm text-green-700">Created</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{stats.updated}</div>
            <div className="text-sm text-blue-700">Updated</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <div className="text-2xl font-bold text-yellow-600">{stats.skipped}</div>
            <div className="text-sm text-yellow-700">Skipped</div>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">{stats.errorsCount}</div>
            <div className="text-sm text-red-700">Errors</div>
          </div>
        </div>
      </div>

      {errorRows.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Error Rows</h4>
          <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Row
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Errors
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {errorRows.map((errorRow, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-900">{errorRow.row}</td>
                    <td className="px-4 py-2 text-sm text-red-600">
                      {errorRow.errors.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

