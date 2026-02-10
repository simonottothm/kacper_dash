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

        // Get all campaigns from tenants where user is admin
        const adminTenantIds = memberships
            .filter((m) => m.role === "admin")
            .map((m) => m.tenant_id);

        const { data: campaigns, error } = await supabase
            .from("campaigns")
            .select(`
        id,
        name,
        description,
        tenant_id,
        created_at,
        tenants!inner(name)
      `)
            .in("tenant_id", adminTenantIds)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching campaigns:", error);
            return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
        }

        const formattedCampaigns = campaigns.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            tenant_id: campaign.tenant_id,
            tenant_name: campaign.tenants.name,
            created_at: campaign.created_at,
        }));

        return NextResponse.json(formattedCampaigns);
    } catch (error) {
        console.error("Error in admin campaigns API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
