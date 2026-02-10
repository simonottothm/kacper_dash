"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2, ListChecks, Mail, Phone, Calendar } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    campaign_id: string;
    campaign_name: string;
    tenant_name: string;
    status_name: string | null;
    created_at: string;
}

interface AdminOwnLeadsProps {
    userId: string;
}

export default function AdminOwnLeads({ userId }: AdminOwnLeadsProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadLeads();
    }, []);

    async function loadLeads() {
        try {
            const response = await fetch("/api/admin/leads");
            if (response.ok) {
                const data = await response.json();
                setLeads(data);
            }
        } catch (error) {
            console.error("Failed to load leads:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(leadId: string) {
        if (!confirm("Möchten Sie diesen Lead wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
            return;
        }

        setDeletingId(leadId);
        try {
            const response = await fetch(`/api/admin/leads/${leadId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setLeads(leads.filter((lead) => lead.id !== leadId));
            } else {
                alert("Fehler beim Löschen des Leads");
            }
        } catch (error) {
            console.error("Failed to delete lead:", error);
            alert("Fehler beim Löschen des Leads");
        } finally {
            setDeletingId(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="bg-card border border-app rounded-2xl shadow-app p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3">
                    <ListChecks className="w-6 h-6 text-accent" />
                </div>
                <p className="text-base font-medium text-[var(--text)] mb-1">Keine Leads gefunden</p>
                <p className="text-sm text-muted">Es wurden noch keine Leads erstellt.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-app rounded-2xl shadow-app overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[var(--bg)] border-b border-app">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Kontakt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Kampagne
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                Erstellt
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                                Aktionen
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app">
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-[var(--bg)] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-[var(--text)]">{lead.name}</div>
                                    <div className="text-xs text-muted">{lead.tenant_name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        {lead.email && (
                                            <div className="flex items-center gap-1.5 text-sm text-muted">
                                                <Mail className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[200px]">{lead.email}</span>
                                            </div>
                                        )}
                                        {lead.phone && (
                                            <div className="flex items-center gap-1.5 text-sm text-muted">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>{lead.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-[var(--text)]">{lead.campaign_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {lead.status_name ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
                                            {lead.status_name}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted">—</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 text-sm text-muted">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{new Date(lead.created_at).toLocaleDateString("de-DE")}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => handleDelete(lead.id)}
                                        disabled={deletingId === lead.id}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-error hover:bg-error-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {deletingId === lead.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        <span>Löschen</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
