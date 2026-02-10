import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import LanguageSelector from "@/components/settings/LanguageSelector";
import { useTranslations } from "next-intl";

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <TopbarProvider
            config={{
                title: "Einstellungen",
            }}
        >
            <div className="px-6 sm:px-8 py-6 w-full max-w-4xl">
                <div className="space-y-6">
                    {/* Language Settings Card */}
                    <div className="bg-card border border-app rounded-2xl shadow-app p-6">
                        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
                            Sprache / Language / Język
                        </h2>
                        <LanguageSelector />
                    </div>

                    {/* Account Settings Card */}
                    <div className="bg-card border border-app rounded-2xl shadow-app p-6">
                        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
                            Konto
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">
                                    E-Mail
                                </label>
                                <input
                                    type="email"
                                    value={user.email || ""}
                                    disabled
                                    className="w-full px-4 py-2 border border-app rounded-xl bg-[var(--bg-secondary)] text-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TopbarProvider>
    );
}
