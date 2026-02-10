"use client";

import { useEffect, useState } from "react";
import { Plus, FolderKanban, Loader2 } from "lucide-react";
import Link from "next/link";
import CreateAdminCampaignModal from "./CreateAdminCampaignModal";

interface AdminCampaign {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    lead_count: number;
}

interface AdminLeadsManagerProps {
    userId: string;
}

export default function AdminLeadsManager({ userId }: AdminLeadsManagerProps) {
    const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadCampaigns();
    }, []);

    async function loadCampaigns() {
        try {
            const response = await fetch("/api/admin/own-campaigns");
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error("Failed to load campaigns:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCampaignCreated = () => {
        setShowCreateModal(false);
        loadCampaigns();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text)]">Eigene Leads</h1>
                    <p className="text-sm text-muted mt-1">
                        Verwalten Sie Ihre eigenen Lead-Kampagnen
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    <span>Neue Kampagne</span>
                </button>
            </div>

            {/* Campaigns List */}
            {campaigns.length === 0 ? (
                <div className="bg-card border border-app rounded-2xl shadow-app p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3">
                        <FolderKanban className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-base font-medium text-[var(--text)] mb-1">
                        Noch keine Kampagnen
                    </p>
                    <p className="text-sm text-muted mb-4">
                        Erstellen Sie Ihre erste Lead-Kampagne
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Kampagne erstellen</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns.map((campaign) => (
                        <Link
                            key={campaign.id}
                            href={`/admin/leads/${campaign.id}`}
                            className="group block p-6 bg-card border border-app rounded-2xl shadow-app hover:shadow-app-md hover:border-accent/50 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                                        <FolderKanban className="w-5 h-5 text-accent" />
                                    </div>
                                </div>
                                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg
                                        className="w-5 h-5 text-accent"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-accent transition-colors">
                                {campaign.name}
                            </h3>
                            {campaign.description && (
                                <p className="text-sm text-muted line-clamp-2 mb-3">
                                    {campaign.description}
                                </p>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">
                                    {campaign.lead_count} {campaign.lead_count === 1 ? "Lead" : "Leads"}
                                </span>
                                <span className="text-muted text-xs">
                                    {new Date(campaign.created_at).toLocaleDateString("de-DE")}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Campaign Modal */}
            <CreateAdminCampaignModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handleCampaignCreated}
            />
        </div>
    );
}
