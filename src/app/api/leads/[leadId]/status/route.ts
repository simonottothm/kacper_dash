import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getLeadById } from "@/lib/data/leads";
import { changeLeadStatus } from "@/lib/data/leadMutations";
import { z } from "zod";

const changeStatusSchema = z.object({
  statusId: z.string().uuid().nullable(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { leadId } = await params;
    const lead = await getLeadById(leadId);

    if (!lead) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Lead not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = changeStatusSchema.parse(body);

    await changeLeadStatus({
      leadId,
      statusId: validated.statusId,
      userId: user.id,
      tenantId: lead.tenant_id,
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

