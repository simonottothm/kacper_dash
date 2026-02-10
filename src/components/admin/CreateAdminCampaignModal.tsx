"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";

interface CreateAdminCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateAdminCampaignModal({
    isOpen,
    onClose,
    onCreated,
}: CreateAdminCampaignModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/admin/own-campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create campaign");
            }

            setName("");
            setDescription("");
            onCreated();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-app rounded-2xl shadow-app-lg max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-app">
                    <h2 className="text-xl font-semibold text-[var(--text)]">
                        Neue Kampagne erstellen
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-[var(--text)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-[var(--text)] mb-2"
                        >
                            Kampagnenname *
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-app rounded-xl bg-card text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="z.B. Meine Lead-Kampagne"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-[var(--text)] mb-2"
                        >
                            Beschreibung
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-app rounded-xl bg-card text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                            placeholder="Optionale Beschreibung..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-error-light border border-error rounded-xl text-sm text-error">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-app rounded-xl text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Erstelle..." : "Erstellen"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
