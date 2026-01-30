import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { markUpdatesSeen } from "@/lib/data/userState";
import { z } from "zod";

const postSchema = z.object({
  tenantId: z.string().uuid(),
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

    const body = await request.json();
    const validated = postSchema.parse(body);

    const activeTenantId = await getActiveTenantId(user.id);
    if (activeTenantId !== validated.tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Invalid tenant" } },
        { status: 403 }
      );
    }

    await markUpdatesSeen(validated.tenantId, user.id);

    return NextResponse.json({ ok: true });
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

