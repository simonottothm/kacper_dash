"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Users, Loader2 } from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    description: string | null;
    tenant_id: string;
    tenant_name: string;
    created_at: string;
}

interface AdminCampaignsListProps {
    userId: string;
}

export default function AdminCampaignsList({ userId }: AdminCampaignsListProps) {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCampaigns() {
            try {
                const response = await fetch("/api/admin/campaigns");
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

        loadCampaigns();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="bg-card border border-app rounded-2xl shadow-app p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3">
                    <FolderKanban className="w-6 h-6 text-accent" />
                </div>
                <p className="text-base font-medium text-[var(--text)] mb-1">Keine Kampagnen gefunden</p>
                <p className="text-sm text-muted">Es wurden noch keine Kampagnen erstellt.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {campaigns.map((campaign) => (
                <Link
                    key={campaign.id}
                    href={`/app/campaigns/${campaign.id}`}
                    className="group block p-5 bg-card border border-app rounded-2xl shadow-app hover:shadow-app-md hover:border-accent/50 transition-all duration-200"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <FolderKanban className="w-5 h-5 text-accent shrink-0" />
                                <h3 className="text-base font-semibold text-[var(--text)] group-hover:text-accent transition-colors duration-200">
                                    {campaign.name}
                                </h3>
                            </div>
                            {campaign.description && (
                                <p className="text-sm text-muted line-clamp-2 mb-2">
                                    {campaign.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted">
                                <Users className="w-3 h-3" />
                                <span>{campaign.tenant_name}</span>
                            </div>
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
