import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminAuth } from "@/lib/auth";

// GET /api/admin/vocabulary-categories - Get all vocabulary categories
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const { data: categories, error } = await supabaseAdmin
            .from("vocabulary_categories")
            .select(`
                *,
                profession:professions(id, name, name_en)
            `)
            .order("order_index", { ascending: true });

        if (error) {
            console.error("Error fetching vocabulary categories:", error);
            return NextResponse.json({ error: "Błąd podczas pobierania kategorii słownictwa" }, { status: 500 });
        }

        return NextResponse.json({ categories });

    } catch (error) {
        console.error("Vocabulary categories fetch error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
