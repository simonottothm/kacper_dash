"use client";

import { useState } from "react";
import type { ImportJob } from "@/lib/data/importJobs";

interface ImportJobsListProps {
  tenantId: string;
  campaignId: string;
  jobs: ImportJob[];
  onRefresh?: () => void;
}

export default function ImportJobsList({
  tenantId,
  campaignId,
  jobs: initialJobs,
  onRefresh,
}: ImportJobsListProps) {
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState(initialJobs);
  const [errorRows, setErrorRows] = useState<
    Array<{ row: number; data: Record<string, unknown>; errors: string[] }>
  >([]);

  if (jobs !== initialJobs) {
    setJobs(initialJobs);
  }

  const handleViewDetails = async (jobId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/imports/${jobId}`);
      const data = await response.json();

      if (data.ok) {
        setSelectedJob(data.data.job);
        setErrorRows(data.data.errorRows || []);
      }
    } catch (err) {
      console.error("Failed to load job details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Import Jobs</h2>
      </div>

      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No import jobs yet</p>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 border border-gray-200 rounded-xl hover:border-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{job.file_name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(job.created_at)}
                  </p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-green-600">
                      Created: {job.stats.created}
                    </span>
                    <span className="text-blue-600">
                      Updated: {job.stats.updated}
                    </span>
                    <span className="text-yellow-600">
                      Skipped: {job.stats.skipped}
                    </span>
                    {job.stats.errorsCount > 0 && (
                      <span className="text-red-600">
                        Errors: {job.stats.errorsCount}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(job.id)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="mt-6 p-4 border border-gray-200 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Import Job Details
            </h3>
            <button
              onClick={() => {
                setSelectedJob(null);
                setErrorRows([]);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-green-50 rounded">
              <div className="text-xl font-bold text-green-600">
                {selectedJob.stats.created}
              </div>
              <div className="text-sm text-green-700">Created</div>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-xl font-bold text-blue-600">
                {selectedJob.stats.updated}
              </div>
              <div className="text-sm text-blue-700">Updated</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <div className="text-xl font-bold text-yellow-600">
                {selectedJob.stats.skipped}
              </div>
              <div className="text-sm text-yellow-700">Skipped</div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="text-xl font-bold text-red-600">
                {selectedJob.stats.errorsCount}
              </div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
          </div>

          {errorRows.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Error Rows</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-64 overflow-y-auto">
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
      )}
    </div>
  );
}

