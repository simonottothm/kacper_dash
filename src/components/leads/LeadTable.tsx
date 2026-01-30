"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Lead, StatusDefinition } from "@/lib/data/leads";
import type { CampaignColumnConfig } from "@/lib/data/campaignUiConfig";
import { getDefaultCampaignColumns } from "@/lib/data/campaignUiConfig";
import LeadModal from "./LeadModal";

interface LeadTableProps {
  leads: Lead[];
  total: number;
  currentPage: number;
  pageSize: number;
  campaignId: string;
  statuses: StatusDefinition[];
  initialLeadId?: string;
  columns?: CampaignColumnConfig[] | null;
}

export default function LeadTable({
  leads,
  total,
  currentPage,
  pageSize,
  campaignId,
  statuses,
  initialLeadId,
  columns,
}: LeadTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialLeadId) {
      const lead = leads.find((l) => l.id === initialLeadId);
      if (lead) {
        setSelectedLead(lead);
        setIsModalOpen(true);
      }
    }
  }, [initialLeadId, leads]);

  const totalPages = Math.ceil(total / pageSize);
  const statusLabels = statuses.reduce(
    (acc, status) => {
      acc[status.id] = status.label;
      return acc;
    },
    {} as Record<string, string>
  );

  const displayColumns = (columns && columns.length ? columns : getDefaultCampaignColumns())
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("leadId", lead.id);
    router.push(`/app/campaigns/${campaignId}?${params.toString()}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("leadId");
    router.push(`/app/campaigns/${campaignId}?${params.toString()}`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const renderCell = (lead: Lead, column: CampaignColumnConfig) => {
    if (column.key === "full_name") return lead.full_name || "—";
    if (column.key === "company") return lead.company || "—";
    if (column.key === "email") return lead.email || "—";
    if (column.key === "phone") return lead.phone || "—";
    if (column.key === "status") return lead.status_id ? statusLabels[lead.status_id] || "—" : "—";
    if (column.key === "next_follow_up_at") return formatDateTime(lead.next_follow_up_at);
    if (column.key === "updated_at") return formatDate(lead.updated_at);

    if (column.key.startsWith("custom_fields.")) {
      const key = column.key.replace("custom_fields.", "");
      const value = lead.custom_fields?.[key];
      if (value === null || value === undefined || value === "") return "—";
      return String(value);
    }

    return "—";
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  if (leads.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-muted">No leads yet</p>
        </div>
        <LeadModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          statuses={statuses}
          campaignId={campaignId}
        />
      </>
    );
  }

  return (
    <>
      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-app">
          <thead className="bg-[var(--bg)]">
            <tr>
              {displayColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-app">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => handleRowClick(lead)}
                className="hover:bg-[var(--bg)] cursor-pointer transition-smooth"
              >
                {displayColumns.map((column) => (
                  <td
                    key={`${lead.id}-${column.key}`}
                    className="px-6 py-3.5 whitespace-nowrap text-sm text-muted"
                  >
                    {renderCell(lead, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 pt-6 border-t border-app flex items-center justify-between">
          <div className="text-sm text-muted">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, total)} of {total} leads
          </div>
          <div className="flex gap-2">
            <PaginationButton
              page={currentPage - 1}
              disabled={currentPage === 1}
              label="Previous"
            />
            <PaginationButton
              page={currentPage + 1}
              disabled={currentPage >= totalPages}
              label="Next"
            />
          </div>
        </div>
      )}

      <LeadModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        statuses={statuses}
        campaignId={campaignId}
      />
    </>
  );
}

function PaginationButton({
  page,
  disabled,
  label,
}: {
  page: number;
  disabled: boolean;
  label: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", page.toString());
    router.push(`?${currentParams.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="px-4 py-2 border border-app rounded-xl text-sm font-medium text-[var(--text)] bg-card hover:bg-[var(--bg)] focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {label}
    </button>
  );
}

