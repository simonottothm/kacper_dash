"use client";

import { useState, useEffect } from "react";
import CampaignManager from "./CampaignManager";
import StatusManager from "./StatusManager";
import TemplateManager from "./TemplateManager";
import CustomFieldManager from "./CustomFieldManager";
import InviteManager from "./InviteManager";
import ImportJobsList from "./ImportJobsList";
import ApiKeyManager from "./ApiKeyManager";
import type { Campaign } from "@/lib/data/adminCampaigns";
import type { StatusDefinition } from "@/lib/data/adminStatus";
import type { UpdateTemplate } from "@/lib/data/adminTemplates";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";
import type { Invitation } from "@/lib/data/adminInvites";
import type { ImportJob } from "@/lib/data/importJobs";
import type { ApiKey } from "@/lib/data/apiKeys";

interface TenantTabsProps {
  tenantId: string;
  campaigns: Campaign[];
  statuses: StatusDefinition[];
  templates: UpdateTemplate[];
  customFields: CustomFieldDefinition[];
  invites: Invitation[];
  apiKeys: ApiKey[];
}

export default function TenantTabs({
  tenantId,
  campaigns,
  statuses,
  templates,
  customFields,
  invites,
  apiKeys,
}: TenantTabsProps) {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const tabs = [
    { id: "campaigns", label: "Campaigns" },
    { id: "statuses", label: "Status Pipeline" },
    { id: "templates", label: "Templates" },
    { id: "customFields", label: "Custom Fields" },
    { id: "invites", label: "Invites" },
    { id: "apiKeys", label: "API Keys" },
    { id: "importLogs", label: "Import Logs" },
  ];

  useEffect(() => {
    if (activeTab === "importLogs" && selectedCampaignId) {
      loadImportJobs();
    }
  }, [activeTab, selectedCampaignId]);

  const loadImportJobs = async () => {
    if (!selectedCampaignId) return;

    setLoadingJobs(true);
    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/campaigns/${selectedCampaignId}/imports`
      );
      const data = await response.json();
      if (data.ok) {
        setImportJobs(data.data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to load import jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-[var(--text)] hover:border-app"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "campaigns" && (
          <CampaignManager
            tenantId={tenantId}
            campaigns={campaigns}
            customFields={customFields}
          />
        )}
        {activeTab === "statuses" && (
          <StatusManager tenantId={tenantId} statuses={statuses} />
        )}
        {activeTab === "templates" && (
          <TemplateManager tenantId={tenantId} templates={templates} />
        )}
        {activeTab === "customFields" && (
          <CustomFieldManager tenantId={tenantId} fields={customFields} />
        )}
        {activeTab === "invites" && (
          <InviteManager tenantId={tenantId} invites={invites} />
        )}
        {activeTab === "apiKeys" && (
          <ApiKeyManager tenantId={tenantId} keys={apiKeys} />
        )}
        {activeTab === "importLogs" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Campaign
              </label>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
              >
                <option value="">Choose a campaign...</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedCampaignId && (
              <ImportJobsList
                tenantId={tenantId}
                campaignId={selectedCampaignId}
                jobs={importJobs}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

