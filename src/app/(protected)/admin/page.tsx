import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import { listAdminTenants } from "@/lib/data/adminTenants";
import { TopbarProvider } from "@/components/layout/TopbarProvider";
import TenantList from "@/components/admin/TenantList";

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
              You are not an admin of any tenants. Please contact support.
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
        <TenantList tenants={tenants} />
      </div>
    </TopbarProvider>
  );
}
