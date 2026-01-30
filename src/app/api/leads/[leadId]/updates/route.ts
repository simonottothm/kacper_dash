import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getLeadById } from "@/lib/data/leads";
import { listLeadUpdates } from "@/lib/data/leadUpdates";
import { createLeadUpdate } from "@/lib/data/leadMutations";
import { z } from "zod";

const createUpdateSchema = z.object({
  type: z.enum(["call_attempt", "note"]),
  callOutcome: z.enum(["reached", "not_reached"]).nullable().optional(),
  comment: z.string().nullable().optional(),
});

export async function GET(
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

    const updates = await listLeadUpdates(leadId);

    return NextResponse.json({ ok: true, data: { updates } });
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
    const validated = createUpdateSchema.parse(body);

    if (validated.type === "call_attempt" && !validated.callOutcome) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "callOutcome is required for call_attempt type",
          },
        },
        { status: 400 }
      );
    }

    const update = await createLeadUpdate({
      leadId,
      type: validated.type,
      callOutcome: validated.callOutcome || null,
      comment: validated.comment || null,
      userId: user.id,
      tenantId: lead.tenant_id,
    });

    return NextResponse.json({ ok: true, data: { update } });
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

