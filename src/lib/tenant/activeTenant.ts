import { cookies } from "next/headers";
import { getMemberships, type Membership } from "@/lib/data/tenants";

const ACTIVE_TENANT_COOKIE = "active_tenant";

export async function getActiveTenantId(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;

  if (activeTenantId) {
    const memberships = await getMemberships(userId);
    const hasAccess = memberships.some((m) => m.tenant_id === activeTenantId);

    if (hasAccess) {
      return activeTenantId;
    }
  }

  return null;
}

export async function resolveActiveTenant(userId: string): Promise<{
  activeTenantId: string | null;
  memberships: Membership[];
  shouldSetCookie: boolean;
}> {
  const memberships = await getMemberships(userId);

  if (memberships.length === 0) {
    return {
      activeTenantId: null,
      memberships: [],
      shouldSetCookie: false,
    };
  }

  if (memberships.length === 1) {
    const singleTenantId = memberships[0].tenant_id;
    const cookieStore = await cookies();
    const currentCookie = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;

    if (currentCookie !== singleTenantId) {
      return {
        activeTenantId: singleTenantId,
        memberships,
        shouldSetCookie: true,
      };
    }

    return {
      activeTenantId: singleTenantId,
      memberships,
      shouldSetCookie: false,
    };
  }

  const activeTenantId = await getActiveTenantId(userId);

  if (activeTenantId) {
    return {
      activeTenantId,
      memberships,
      shouldSetCookie: false,
    };
  }

  return {
    activeTenantId: memberships[0].tenant_id,
    memberships,
    shouldSetCookie: true,
  };
}

export function setActiveTenantCookie(tenantId: string) {
  const cookieStore = cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

