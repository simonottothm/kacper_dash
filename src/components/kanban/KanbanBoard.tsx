"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import KanbanColumn from "./KanbanColumn";
import type { Lead } from "@/lib/data/leads";
import type { StatusDefinition } from "@/lib/data/leads";

interface KanbanBoardProps {
  campaignId: string;
  statuses: StatusDefinition[];
  initialLeads: Lead[];
}

export default function KanbanBoard({
  campaignId,
  statuses,
  initialLeads,
}: KanbanBoardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const lead = leads.find((l) => l.id === event.active.id);
    setDraggedLead(lead || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setDraggedLead(null);

    const { active, over } = event;

    if (!over || !active) {
      return;
    }

    const leadId = active.id as string;
    const newStatusId = over.id === "null" ? null : (over.id as string);

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status_id === newStatusId) {
      return;
    }

    const previousStatusId = lead.status_id;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status_id: newStatusId } : l))
    );

    try {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          statusId: newStatusId,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || "Failed to update status");
      }

      router.refresh();
    } catch (err) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status_id: previousStatusId } : l
        )
      );
      alert(err instanceof Error ? err.message : "Failed to update lead status");
    }
  };

  const statusMap = new Map(statuses.map((s) => [s.id, s]));
  const leadsByStatus = new Map<string | null, Lead[]>();

  leadsByStatus.set(null, []);

  for (const lead of leads) {
    const statusId = lead.status_id || null;
    if (!leadsByStatus.has(statusId)) {
      leadsByStatus.set(statusId, []);
    }
    leadsByStatus.get(statusId)!.push(lead);
  }

  const sortedStatuses = [
    ...statuses.sort((a, b) => a.sort_order - b.sort_order),
    { id: null, label: "No Status" } as { id: null; label: string },
  ];

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {sortedStatuses.map((status) => (
          <KanbanColumn
            key={status.id || "null"}
            status={status}
            leads={leadsByStatus.get(status.id) || []}
            campaignId={campaignId}
          />
        ))}
      </div>
      <DragOverlay>
        {draggedLead ? (
          <div className="p-3 bg-card border-2 border-accent rounded-xl shadow-app-md opacity-90">
            <div className="font-medium text-sm text-[var(--text)]">
              {draggedLead.full_name || "Unnamed Lead"}
            </div>
            {draggedLead.company && (
              <div className="text-xs text-muted">{draggedLead.company}</div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

