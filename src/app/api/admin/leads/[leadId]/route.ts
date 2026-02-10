import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getMemberships } from "@/lib/data/tenants";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const memberships = await getMemberships(user.id);
        const isAdmin = memberships.some((m) => m.role === "admin");

        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { leadId } = await params;
        const supabase = await createClient();

        // Verify the lead belongs to a tenant where user is admin
        const { data: lead, error: fetchError } = await supabase
            .from("leads")
            .select(`
        id,
        campaigns!inner(
          tenant_id
        )
      `)
            .eq("id", leadId)
            .single();

        if (fetchError || !lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const adminTenantIds = memberships
            .filter((m) => m.role === "admin")
            .map((m) => m.tenant_id);

        if (!adminTenantIds.includes((lead.campaigns as any).tenant_id)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete the lead
        const { error: deleteError } = await supabase
            .from("leads")
            .delete()
            .eq("id", leadId);

        if (deleteError) {
            console.error("Error deleting lead:", deleteError);
            return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in admin delete lead API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
