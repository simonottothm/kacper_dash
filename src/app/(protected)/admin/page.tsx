import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import { listAdminTenants } from "@/lib/data/adminTenants";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import AdminTabs from "@/components/admin/AdminTabs";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const activeTenantId = await getActiveTenantId(user.id);
  const memberships = await getMemberships(user.id);
  const isAdmin = memberships.some((m) => m.role === "admin");
  const tenants = await listAdminTenants();

  if (tenants.length === 0) {
    return (
      <TopbarProvider
        config={{
          title: "Admin",
          backHref: "/app",
          backLabel: "Dashboard",
        }}
      >
        <div className="px-6 sm:px-8 py-6 w-full">
          <div className="bg-card border border-app rounded-2xl shadow-app p-12 text-center">
            <p className="text-muted">
              Sie sind kein Administrator eines Mandanten. Bitte kontaktieren Sie den Support.
            </p>
          </div>
        </div>
      </TopbarProvider>
    );
  }

  return (
    <TopbarProvider
      config={{
        title: "Admin",
        backHref: "/app",
        backLabel: "Dashboard",
      }}
    >
      <div className="px-6 sm:px-8 py-6 w-full">
        <AdminTabs tenants={tenants} userId={user.id} />
      </div>
    </TopbarProvider>
  );
}
