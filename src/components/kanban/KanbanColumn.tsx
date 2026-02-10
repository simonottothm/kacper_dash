"use client";

import { useDroppable } from "@dnd-kit/core";
import LeadCard from "./LeadCard";
import type { Lead } from "@/lib/data/leads";
import type { StatusDefinition } from "@/lib/data/adminStatus";

interface KanbanColumnProps {
  status: { id: string | null; label: string };
  leads: Lead[];
  campaignId: string;
}

export default function KanbanColumn({ status, leads, campaignId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id || "null",
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-[var(--bg)] rounded-xl p-4 border border-app ${isOver ? "bg-accent-light border-2 border-accent" : ""
        }`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-[var(--text)]">{status.label}</h3>
        <p className="text-xs text-muted">{leads.length} leads</p>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
        {leads.length === 0 ? (
          <div className="text-center py-8 text-muted text-sm">No leads</div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} campaignId={campaignId} />
          ))
        )}
      </div>
    </div>
  );
}

