import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getMemberships } from "@/lib/data/tenants";
import AppShell from "@/components/layout/AppShell";
import MarkSeenClient from "@/components/notifications/MarkSeenClient";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const activeTenantId = await getActiveTenantId(user.id);
  const memberships = await getMemberships(user.id);
  const isAdmin = memberships.some((m) => m.role === "admin");

  return (
    <>
      <MarkSeenClient tenantId={activeTenantId || ""} />
      <AppShell
        userEmail={user.email || ""}
        memberships={memberships}
        activeTenantId={activeTenantId}
        isAdmin={isAdmin}
      >
        {children}
      </AppShell>
    </>
  );
}
