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

        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const search = url.searchParams.get("search") || "";
        const professionId = url.searchParams.get("professionId") || "";
        const sortBy = url.searchParams.get("sortBy") || "order_index";
        const sortOrder = url.searchParams.get("sortOrder") || "asc";

        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from("vocabulary_categories")
            .select(`
                *,
                profession:professions(id, name, name_en),
                _count:vocabulary(count)
            `, { count: 'exact' });

        // Apply filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (professionId) {
            query = query.eq("profession_id", professionId);
        }

        // Apply sorting
        const ascending = sortOrder === "asc";
        switch (sortBy) {
            case "profession":
                // First order by profession name, then by order_index
                query = query
                    .order("profession_id", { ascending })
                    .order("order_index", { ascending: true });
                break;
            case "name":
                query = query.order("name", { ascending });
                break;
            case "created_at":
                query = query.order("created_at", { ascending });
                break;
            case "order_index":
            default:
                query = query
                    .order("order_index", { ascending: true })
                    .order("created_at", { ascending: false });
                break;
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: categories, error, count } = await query;

        if (error) {
            console.error("Error fetching vocabulary categories:", error);
            return NextResponse.json({ error: "Błąd podczas pobierania kategorii słownictwa" }, { status: 500 });
        }

        const totalPages = Math.ceil((count || 0) / limit);

        return NextResponse.json({ 
            categories,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count || 0,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        console.error("Vocabulary categories fetch error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

// POST /api/admin/vocabulary-categories - Create new vocabulary category
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const body = await request.json();
        const { name, nameEn, description, professionId, orderIndex } = body;

        // Validate required fields
        if (!name || !nameEn || !professionId) {
            return NextResponse.json({ 
                error: "Wypełnij wymagane pola: nazwa, nazwa angielska, zawód" 
            }, { status: 400 });
        }

        // Check if profession exists
        const { data: profession, error: professionError } = await supabaseAdmin
            .from("professions")
            .select("id")
            .eq("id", professionId)
            .single();

        if (professionError || !profession) {
            return NextResponse.json({ error: "Wybrany zawód nie istnieje" }, { status: 400 });
        }

        // If no order index provided, get the next available one
        let finalOrderIndex = orderIndex;
        if (!finalOrderIndex) {
            const { data: maxOrder } = await supabaseAdmin
                .from("vocabulary_categories")
                .select("order_index")
                .eq("profession_id", professionId)
                .order("order_index", { ascending: false })
                .limit(1)
                .single();

            finalOrderIndex = (maxOrder?.order_index || 0) + 1;
        }

        const { data: category, error } = await supabaseAdmin
            .from("vocabulary_categories")
            .insert({
                name,
                name_en: nameEn,
                description: description || null,
                profession_id: professionId,
                order_index: finalOrderIndex
            })
            .select(`
                *,
                profession:professions(id, name, name_en)
            `)
            .single();

        if (error) {
            console.error("Error creating vocabulary category:", error);
            return NextResponse.json({ error: "Błąd podczas tworzenia kategorii" }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            category,
            message: "Kategoria została utworzona pomyślnie" 
        });

    } catch (error) {
        console.error("Vocabulary category creation error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

// PUT /api/admin/vocabulary-categories - Update vocabulary category
export async function PUT(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, nameEn, description, professionId, orderIndex } = body;

        // Validate required fields
        if (!id || !name || !nameEn || !professionId) {
            return NextResponse.json({ 
                error: "Wypełnij wymagane pola: ID, nazwa, nazwa angielska, zawód" 
            }, { status: 400 });
        }

        // Check if category exists
        const { data: existingCategory, error: existingError } = await supabaseAdmin
            .from("vocabulary_categories")
            .select("id")
            .eq("id", id)
            .single();

        if (existingError || !existingCategory) {
            return NextResponse.json({ error: "Kategoria nie istnieje" }, { status: 404 });
        }

        // Check if profession exists
        const { data: profession, error: professionError } = await supabaseAdmin
            .from("professions")
            .select("id")
            .eq("id", professionId)
            .single();

        if (professionError || !profession) {
            return NextResponse.json({ error: "Wybrany zawód nie istnieje" }, { status: 400 });
        }

        const { data: category, error } = await supabaseAdmin
            .from("vocabulary_categories")
            .update({
                name,
                name_en: nameEn,
                description: description || null,
                profession_id: professionId,
                order_index: orderIndex || 1
            })
            .eq("id", id)
            .select(`
                *,
                profession:professions(id, name, name_en)
            `)
            .single();

        if (error) {
            console.error("Error updating vocabulary category:", error);
            return NextResponse.json({ error: "Błąd podczas aktualizacji kategorii" }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            category,
            message: "Kategoria została zaktualizowana pomyślnie" 
        });

    } catch (error) {
        console.error("Vocabulary category update error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

// DELETE /api/admin/vocabulary-categories - Delete vocabulary category
export async function DELETE(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Brak ID kategorii" }, { status: 400 });
        }

        // Check if category exists and has vocabulary entries
        const { data: category, error: categoryError } = await supabaseAdmin
            .from("vocabulary_categories")
            .select(`
                id,
                name,
                vocabulary(count)
            `)
            .eq("id", id)
            .single();

        if (categoryError || !category) {
            return NextResponse.json({ error: "Kategoria nie istnieje" }, { status: 404 });
        }

        // Check if category has vocabulary entries
        const { count: vocabularyCount } = await supabaseAdmin
            .from("vocabulary")
            .select("*", { count: 'exact', head: true })
            .eq("category_id", id);

        if (vocabularyCount && vocabularyCount > 0) {
            return NextResponse.json({ 
                error: `Nie można usunąć kategorii "${category.name}" - zawiera ${vocabularyCount} wpis(ów) słownictwa. Usuń najpierw wszystkie wpisy z tej kategorii.` 
            }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("vocabulary_categories")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting vocabulary category:", error);
            return NextResponse.json({ error: "Błąd podczas usuwania kategorii" }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            message: "Kategoria została usunięta pomyślnie" 
        });

    } catch (error) {
        console.error("Vocabulary category deletion error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
