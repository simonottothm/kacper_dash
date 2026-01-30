import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createTenant } from "@/lib/data/adminTenants";
import { getMemberships } from "@/lib/data/tenants";
import { z } from "zod";

const createTenantSchema = z.object({
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
    const memberships = await getMemberships(user.id);
    const isAdmin = memberships.some((m) => m.role === "admin");

    if (!isAdmin && !allowedEmails.includes(user.email || "")) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "Tenant creation is restricted to authorized administrators",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = createTenantSchema.parse(body);

    const tenant = await createTenant(validated.name, user.id);

    return NextResponse.json({ ok: true, data: { tenant } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

