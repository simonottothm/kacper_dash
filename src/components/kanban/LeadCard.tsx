"use client";

import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import type { Lead } from "@/lib/data/leads";

interface LeadCardProps {
  lead: Lead;
  campaignId: string;
}

export default function LeadCard({ lead, campaignId }: LeadCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleClick = () => {
    router.push(`/app/campaigns/${campaignId}?leadId=${lead.id}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`p-3 bg-card border border-app rounded-xl shadow-app hover:shadow-app-md hover:border-accent cursor-pointer transition-all ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="font-medium text-sm text-[var(--text)] mb-1">
        {lead.full_name || "Unnamed Lead"}
      </div>
      {lead.company && (
        <div className="text-xs text-muted mb-2">{lead.company}</div>
      )}
      <div className="flex items-center gap-3 text-xs text-muted">
        {lead.email && (
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate max-w-[120px]">{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{lead.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

