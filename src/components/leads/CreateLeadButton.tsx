"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { StatusDefinition, Lead } from "@/lib/data/leads";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";
import CreateLeadModal from "./CreateLeadModal";

interface CreateLeadButtonProps {
  campaignId: string;
  statuses: StatusDefinition[];
  customFields: CustomFieldDefinition[];
}

export default function CreateLeadButton({
  campaignId,
  statuses,
  customFields,
}: CreateLeadButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleCreated = (lead: Lead) => {
    router.refresh();
    const params = new URLSearchParams(searchParams.toString());
    params.set("leadId", lead.id);
    router.push(`/app/campaigns/${campaignId}?${params.toString()}`);
    setToast("Lead erstellt");
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent text-sm font-medium transition-colors"
      >
        Lead erstellen
      </button>

      <CreateLeadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        campaignId={campaignId}
        statuses={statuses}
        customFields={customFields}
        onCreated={handleCreated}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-card border border-app shadow-app rounded-xl px-4 py-2 text-sm text-[var(--text)]">
          {toast}
        </div>
      )}
    </>
  );
}

