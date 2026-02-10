import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getMemberships } from "@/lib/data/tenants";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

        const supabase = await createClient();

        // Get all leads from campaigns in tenants where user is admin
        const adminTenantIds = memberships
            .filter((m) => m.role === "admin")
            .map((m) => m.tenant_id);

        const { data: leads, error } = await supabase
            .from("leads")
            .select(`
        id,
        name,
        email,
        phone,
        campaign_id,
        status_id,
        created_at,
        campaigns!inner(
          id,
          name,
          tenant_id,
          tenants!inner(name)
        ),
        lead_statuses(name)
      `)
            .in("campaigns.tenant_id", adminTenantIds)
            .order("created_at", { ascending: false })
            .limit(1000);

        if (error) {
            console.error("Error fetching leads:", error);
            return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
        }

        const formattedLeads = leads.map((lead: any) => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            campaign_id: lead.campaign_id,
            campaign_name: lead.campaigns.name,
            tenant_name: lead.campaigns.tenants.name,
            status_name: lead.lead_statuses?.name || null,
            created_at: lead.created_at,
        }));

        return NextResponse.json(formattedLeads);
    } catch (error) {
        console.error("Error in admin leads API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
