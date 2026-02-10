import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getMemberships } from "@/lib/data/tenants";
import { getServiceClient } from "@/lib/supabase/service";

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

        const supabase = getServiceClient();

        // Get admin's own campaigns (tenant_id is NULL for admin-owned campaigns)
        const { data: campaigns, error } = await supabase
            .from("campaigns")
            .select(`
        id,
        name,
        description,
        created_at,
        leads(count)
      `)
            .is("tenant_id", null)
            .eq("created_by", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching admin campaigns:", error);
            return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
        }

        const formattedCampaigns = campaigns.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            description: campaign.description,
            created_at: campaign.created_at,
            lead_count: campaign.leads?.[0]?.count || 0,
        }));

        return NextResponse.json(formattedCampaigns);
    } catch (error) {
        console.error("Error in admin own campaigns API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const { name, description } = body;

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const supabase = getServiceClient();

        const { data: campaign, error } = await supabase
            .from("campaigns")
            .insert({
                name: name.trim(),
                description: description?.trim() || null,
                tenant_id: null,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error creating admin campaign:", JSON.stringify(error, null, 2));
            return NextResponse.json({ error: `Database error: ${error.message} (${error.code})` }, { status: 500 });
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("Error in create admin campaign API:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
