import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getActiveTenantId } from "@/lib/tenant/activeTenant";
import { getNotificationPreferences, upsertNotificationPreferences } from "@/lib/data/notifications";
import { z } from "zod";

const putSchema = z.object({
  tenantId: z.string().uuid(),
  emailNewUpdates: z.boolean(),
  emailOverdueFollowups: z.boolean(),
  digestFrequency: z.enum(["daily", "weekly", "immediate"]),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "tenantId required" } },
        { status: 400 }
      );
    }

    const activeTenantId = await getActiveTenantId(user.id);
    if (activeTenantId !== tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Invalid tenant" } },
        { status: 403 }
      );
    }

    const prefs = await getNotificationPreferences(tenantId, user.id);

    return NextResponse.json({
      ok: true,
      data: prefs || {
        tenant_id: tenantId,
        user_id: user.id,
        email_new_updates: false,
        email_overdue_followups: false,
        digest_frequency: "daily",
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
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

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = putSchema.parse(body);

    const activeTenantId = await getActiveTenantId(user.id);
    if (activeTenantId !== validated.tenantId) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Invalid tenant" } },
        { status: 403 }
      );
    }

    await upsertNotificationPreferences(validated.tenantId, user.id, {
      email_new_updates: validated.emailNewUpdates,
      email_overdue_followups: validated.emailOverdueFollowups,
      digest_frequency: validated.digestFrequency,
    });

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

