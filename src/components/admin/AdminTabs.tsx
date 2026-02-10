"use client";

import { useState } from "react";
import { Users, FolderKanban, ListChecks } from "lucide-react";
import TenantList from "./TenantList";
import AdminCampaignsList from "./AdminCampaignsList";
import AdminOwnLeads from "./AdminOwnLeads";

interface AdminTabsProps {
    tenants: Awaited<ReturnType<typeof import("@/lib/data/adminTenants").listAdminTenants>>;
    userId: string;
}

export default function AdminTabs({ tenants, userId }: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState<"tenants" | "campaigns" | "leads">("tenants");

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-card border border-app rounded-2xl shadow-app overflow-hidden">
                <div className="flex border-b border-app overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("tenants")}
                        className={`flex-1 min-w-0 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors duration-150 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === "tenants"
                                ? "text-accent border-b-2 border-accent bg-accent-light/30"
                                : "text-muted hover:text-[var(--text)] hover:bg-[var(--bg)]"
                            }`}
                    >
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Kunden</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("campaigns")}
                        className={`flex-1 min-w-0 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors duration-150 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === "campaigns"
                                ? "text-accent border-b-2 border-accent bg-accent-light/30"
                                : "text-muted hover:text-[var(--text)] hover:bg-[var(--bg)]"
                            }`}
                    >
                        <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Kampagnen</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("leads")}
                        className={`flex-1 min-w-0 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors duration-150 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === "leads"
                                ? "text-accent border-b-2 border-accent bg-accent-light/30"
                                : "text-muted hover:text-[var(--text)] hover:bg-[var(--bg)]"
                            }`}
                    >
                        <ListChecks className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Eigene Leads</span>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "tenants" && <TenantList tenants={tenants} />}
                {activeTab === "campaigns" && <AdminCampaignsList userId={userId} />}
                {activeTab === "leads" && <AdminOwnLeads userId={userId} />}
            </div>
        </div>
    );
}
