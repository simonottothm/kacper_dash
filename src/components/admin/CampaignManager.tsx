"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Campaign } from "@/lib/data/adminCampaigns";
import type { CustomFieldDefinition } from "@/lib/data/adminCustomFields";
import ImportWizard from "@/components/import/ImportWizard";

interface CampaignManagerProps {
  tenantId: string;
  campaigns: Campaign[];
  customFields: CustomFieldDefinition[];
}

export default function CampaignManager({
  tenantId,
  campaigns,
  customFields,
}: CampaignManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importCampaignId, setImportCampaignId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null }),
      });

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to create campaign");

      router.refresh();
      setName("");
      setDescription("");
      setIsCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (campaignId: string, currentArchived: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/tenants/${tenantId}/campaigns/${campaignId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();
      if (!data.ok) throw new Error(data.error?.message || "Failed to update campaign");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover sm:text-sm"
        >
          {isCreating ? "Cancel" : "Create Campaign"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl sm:text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover disabled:opacity-50 sm:text-sm"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
          >
            <div>
              <h3 className="font-medium text-gray-900">{campaign.name}</h3>
              {campaign.description && (
                <p className="text-sm text-gray-500">{campaign.description}</p>
              )}
              {campaign.is_archived && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  Archived
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setImportCampaignId(campaign.id)}
                className="px-3 py-1 text-sm border border-accent/30 text-accent rounded-xl hover:bg-accent-light"
              >
                Import CSV
              </button>
              <button
                onClick={() => handleArchive(campaign.id, campaign.is_archived)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                {campaign.is_archived ? "Unarchive" : "Archive"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {importCampaignId && (
        <ImportWizard
          tenantId={tenantId}
          campaignId={importCampaignId}
          customFields={customFields}
          onClose={() => setImportCampaignId(null)}
        />
      )}
    </div>
  );
}

