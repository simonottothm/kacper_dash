import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getMemberships } from "@/lib/data/tenants";

const ACTIVE_TENANT_COOKIE = "active_tenant";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId");
  const redirectTo = searchParams.get("redirect") || "/app";

  if (!tenantId || typeof tenantId !== "string") {
    redirect("/app");
  }

  const memberships = await getMemberships(user.id);
  const hasAccess = memberships.some((m) => m.tenant_id === tenantId);

  if (!hasAccess) {
    redirect("/app");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect(redirectTo);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tenantId } = body;

  if (!tenantId || typeof tenantId !== "string") {
    return NextResponse.json({ error: "Invalid tenantId" }, { status: 400 });
  }

  const memberships = await getMemberships(user.id);
  const hasAccess = memberships.some((m) => m.tenant_id === tenantId);

  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TENANT_COOKIE, tenantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ success: true });
}

