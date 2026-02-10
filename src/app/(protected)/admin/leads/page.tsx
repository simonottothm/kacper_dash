import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getMemberships } from "@/lib/data/tenants";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import AdminLeadsManager from "@/components/admin/AdminLeadsManager";

export default async function AdminLeadsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const memberships = await getMemberships(user.id);
    const isAdmin = memberships.some((m) => m.role === "admin");

    if (!isAdmin) {
        redirect("/app");
    }

    return (
        <TopbarProvider
            config={{
                title: "Eigene Leads",
                backHref: "/admin",
                backLabel: "Admin",
            }}
        >
            <div className="px-6 sm:px-8 py-6 w-full">
                <AdminLeadsManager userId={user.id} />
            </div>
        </TopbarProvider>
    );
}
