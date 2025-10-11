import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminAuth } from "@/lib/auth";

// GET /api/admin/vocabulary - Get all vocabulary with optional filtering
export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const categoryId = searchParams.get("categoryId") || "";
        const professionId = searchParams.get("professionId") || "";
        const difficultyLevel = searchParams.get("difficultyLevel") || "";
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const offset = (page - 1) * limit;

        // Build query
        let query = supabaseAdmin
            .from("vocabulary")
            .select(`
                *,
                category:vocabulary_categories(
                    id,
                    name,
                    name_en,
                    profession:professions(id, name, name_en)
                )
            `);

        // Apply filters first
        if (search) {
            query = query.or(`term_en.ilike.%${search}%,term_pl.ilike.%${search}%,definition_en.ilike.%${search}%,definition_pl.ilike.%${search}%`);
        }

        if (categoryId) {
            query = query.eq("category_id", categoryId);
        }

        if (professionId) {
            // Filter by profession through category relationship
            // First get category IDs for the profession
            const { data: professionCategories } = await supabaseAdmin
                .from("vocabulary_categories")
                .select("id")
                .eq("profession_id", professionId);
            
            if (professionCategories && professionCategories.length > 0) {
                const categoryIds = professionCategories.map(cat => cat.id);
                query = query.in("category_id", categoryIds);
            } else {
                // No categories for this profession, return empty result
                query = query.eq("category_id", "00000000-0000-0000-0000-000000000000"); // impossible UUID
            }
        }

        if (difficultyLevel) {
            query = query.eq("difficulty_level", parseInt(difficultyLevel));
        }

        // Apply sorting
        const ascending = sortOrder === "asc";
        query = query.order(sortBy, { ascending });

        // Get total count for pagination (with same filters)
        let countQuery = supabaseAdmin
            .from("vocabulary")
            .select("*", { count: "exact", head: true });

        if (search) {
            countQuery = countQuery.or(`term_en.ilike.%${search}%,term_pl.ilike.%${search}%,definition_en.ilike.%${search}%,definition_pl.ilike.%${search}%`);
        }

        if (categoryId) {
            countQuery = countQuery.eq("category_id", categoryId);
        }

        if (professionId) {
            // Apply same profession filter for count
            const { data: professionCategories } = await supabaseAdmin
                .from("vocabulary_categories")
                .select("id")
                .eq("profession_id", professionId);
            
            if (professionCategories && professionCategories.length > 0) {
                const categoryIds = professionCategories.map(cat => cat.id);
                countQuery = countQuery.in("category_id", categoryIds);
            } else {
                countQuery = countQuery.eq("category_id", "00000000-0000-0000-0000-000000000000");
            }
        }

        if (difficultyLevel) {
            countQuery = countQuery.eq("difficulty_level", parseInt(difficultyLevel));
        }

        const { count } = await countQuery;

        // Get paginated data
        const { data: vocabulary, error } = await query
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error fetching vocabulary:", error);
            return NextResponse.json({ error: "Błąd podczas pobierania słownictwa" }, { status: 500 });
        }

        return NextResponse.json({
            vocabulary,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error("Vocabulary fetch error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

// POST /api/admin/vocabulary - Create new vocabulary entry
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const body = await request.json();
        const {
            category_id,
            term_en,
            term_pl,
            definition_en,
            definition_pl,
            pronunciation,
            audio_url,
            image_url,
            example_sentence_en,
            example_sentence_pl,
            difficulty_level
        } = body;

        // Validate required fields
        if (!category_id || !term_en || !term_pl) {
            return NextResponse.json({ 
                error: "Wymagane pola: kategoria, termin angielski, termin polski" 
            }, { status: 400 });
        }

        // Insert new vocabulary entry
        const { data: vocabulary, error } = await supabaseAdmin
            .from("vocabulary")
            .insert({
                category_id,
                term_en,
                term_pl,
                definition_en,
                definition_pl,
                pronunciation,
                audio_url,
                image_url,
                example_sentence_en,
                example_sentence_pl,
                difficulty_level: difficulty_level || 1
            })
            .select(`
                *,
                category:vocabulary_categories(
                    id,
                    name,
                    name_en,
                    profession:professions(id, name, name_en)
                )
            `)
            .single();

        if (error) {
            console.error("Error creating vocabulary:", error);
            return NextResponse.json({ error: "Błąd podczas tworzenia wpisu słownictwa" }, { status: 500 });
        }

        return NextResponse.json({ vocabulary }, { status: 201 });

    } catch (error) {
        console.error("Vocabulary creation error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

// PUT /api/admin/vocabulary - Update vocabulary entry
export async function PUT(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const body = await request.json();
        const {
            id,
            category_id,
            term_en,
            term_pl,
            definition_en,
            definition_pl,
            pronunciation,
            audio_url,
            image_url,
            example_sentence_en,
            example_sentence_pl,
            difficulty_level
        } = body;

        // Validate required fields
        if (!id || !category_id || !term_en || !term_pl) {
            return NextResponse.json({ 
                error: "Wymagane pola: ID, kategoria, termin angielski, termin polski" 
            }, { status: 400 });
        }

        // Update vocabulary entry
        const { data: vocabulary, error } = await supabaseAdmin
            .from("vocabulary")
            .update({
                category_id,
                term_en,
                term_pl,
                definition_en,
                definition_pl,
                pronunciation,
                audio_url,
                image_url,
                example_sentence_en,
                example_sentence_pl,
                difficulty_level: difficulty_level || 1,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select(`
                *,
                category:vocabulary_categories(
                    id,
                    name,
                    name_en,
                    profession:professions(id, name, name_en)
                )
            `)
            .single();

        if (error) {
            console.error("Error updating vocabulary:", error);
            return NextResponse.json({ error: "Błąd podczas aktualizacji wpisu słownictwa" }, { status: 500 });
        }

        return NextResponse.json({ vocabulary });

    } catch (error) {
        console.error("Vocabulary update error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

// DELETE /api/admin/vocabulary - Delete vocabulary entry
export async function DELETE(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Wymagane ID wpisu słownictwa" }, { status: 400 });
        }

        // Delete vocabulary entry
        const { error } = await supabaseAdmin
            .from("vocabulary")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting vocabulary:", error);
            return NextResponse.json({ error: "Błąd podczas usuwania wpisu słownictwa" }, { status: 500 });
        }

        return NextResponse.json({ message: "Wpis słownictwa został usunięty" });

    } catch (error) {
        console.error("Vocabulary deletion error:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
