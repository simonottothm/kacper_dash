"use client";

import { useState } from "react";
import type { CampaignColumnConfig } from "@/lib/data/campaignUiConfig";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";
import ColumnsSettings from "./ColumnsSettings";
import IntegrationSetup from "./IntegrationSetup";

interface CampaignSettingsTabsProps {
  campaignId: string;
  tenantId: string;
  columns: CampaignColumnConfig[];
  customFields: CustomFieldDefinition[];
}

export default function CampaignSettingsTabs({
  campaignId,
  tenantId,
  columns,
  customFields,
}: CampaignSettingsTabsProps) {
  const [tab, setTab] = useState<"columns" | "integration">("columns");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-app">
        <button
          onClick={() => setTab("columns")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            tab === "columns"
              ? "text-accent border-accent"
              : "text-muted border-transparent hover:text-[var(--text)]"
          }`}
        >
          Columns
        </button>
        <button
          onClick={() => setTab("integration")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            tab === "integration"
              ? "text-accent border-accent"
              : "text-muted border-transparent hover:text-[var(--text)]"
          }`}
        >
          Integration
        </button>
      </div>

      {tab === "columns" ? (
        <ColumnsSettings
          campaignId={campaignId}
          tenantId={tenantId}
          initialColumns={columns}
          customFields={customFields}
        />
      ) : (
        <IntegrationSetup campaignId={campaignId} tenantId={tenantId} customFields={customFields} />
      )}
    </div>
  );
}

