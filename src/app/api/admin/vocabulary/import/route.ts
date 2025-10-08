import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminAuth } from "@/lib/auth";

interface VocabularyImportItem {
    term_en: string;
    term_pl: string;
    definition_en?: string;
    definition_pl?: string;
    pronunciation?: string;
    example_sentence_en?: string;
    example_sentence_pl?: string;
    difficulty_level?: number;
    category_id?: string;
}

// POST /api/admin/vocabulary/import - Import vocabulary from CSV
export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth(request);
        if (!authResult.isValid || !authResult.user) {
            return NextResponse.json({ error: "Nieautoryzowany dostęp" }, { status: 401 });
        }

        const body = await request.json();
        const { items } = body as { items: VocabularyImportItem[] };

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Brak danych do importu" },
                { status: 400 }
            );
        }

        // Validate and prepare items
        const preparedItems = items.map((item) => {
            // Validate required fields
            if (!item.term_en || !item.term_pl) {
                throw new Error("Brak wymaganych pól: term_en i term_pl");
            }

            // Ensure difficulty level is within range
            const difficultyLevel = item.difficulty_level 
                ? Math.min(Math.max(parseInt(String(item.difficulty_level)), 1), 5)
                : 1;

            return {
                term_en: item.term_en.trim(),
                term_pl: item.term_pl.trim(),
                definition_en: item.definition_en?.trim() || null,
                definition_pl: item.definition_pl?.trim() || null,
                pronunciation: item.pronunciation?.trim() || null,
                example_sentence_en: item.example_sentence_en?.trim() || null,
                example_sentence_pl: item.example_sentence_pl?.trim() || null,
                difficulty_level: difficultyLevel,
                category_id: item.category_id || null,
                audio_url: null,
                image_url: null,
            };
        });

        // Insert items into database
        const { data, error } = await supabaseAdmin
            .from("vocabulary")
            .insert(preparedItems)
            .select();

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: "Błąd podczas importu słownictwa" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Pomyślnie zaimportowano ${data.length} pozycji słownictwa`,
            count: data.length,
        });
    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Błąd serwera" },
            { status: 500 }
        );
    }
}
