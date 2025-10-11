import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminAuth } from "@/lib/auth";

// GET /api/admin/vocabulary/categories - Get all vocabulary categories
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const professionId = searchParams.get("professionId");

        let query = supabaseAdmin
            .from("vocabulary_categories")
            .select(`
                id,
                name,
                name_en,
                profession_id,
                profession:professions(
                    id,
                    name,
                    name_en
                )
            `)
            .order("name");

        // Filter by profession if provided
        if (professionId) {
            query = query.eq("profession_id", professionId);
        }

        const { data: categories, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: "Błąd podczas pobierania kategorii" },
                { status: 500 }
            );
        }

        return NextResponse.json(categories || []);
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json(
            { error: "Błąd serwera" },
            { status: 500 }
        );
    }
}

// POST /api/admin/vocabulary/categories - Create new category
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const body = await request.json();
        const { name, name_en, profession_id } = body;

        if (!name || !profession_id) {
            return NextResponse.json(
                { error: "Brak wymaganych pól: name i profession_id" },
                { status: 400 }
            );
        }

        const { data: category, error } = await supabaseAdmin
            .from("vocabulary_categories")
            .insert({
                name: name.trim(),
                name_en: name_en?.trim() || name.trim(),
                profession_id,
            })
            .select(`
                id,
                name,
                name_en,
                profession_id,
                profession:professions(
                    id,
                    name,
                    name_en
                )
            `)
            .single();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: "Błąd podczas tworzenia kategorii" },
                { status: 500 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Category create error:", error);
        return NextResponse.json(
            { error: "Błąd serwera" },
            { status: 500 }
        );
    }
}
