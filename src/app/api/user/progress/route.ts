import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

// POST /api/user/progress - create or update progress
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { content_type, content_id, progress } = body;

    if (!content_type || !content_id || progress == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Upsert progress row for (user_id, content_type, content_id)
    // Let DB triggers/defaults set created_at/updated_at; only send meaningful fields
    const payload: any = {
      user_id: user.id,
      content_type,
      content_id,
      completed: progress.completed ?? false,
      score: progress.score ?? null,
      time_spent: progress.time_spent ?? null,
      attempts: progress.attempts ?? 1,
      last_attempt_at: new Date().toISOString(),
    };

    // For games, always create new session records. For other content types, use upsert.
    if (content_type === 'game') {
        // For completed games, create a new record. For in-progress, we don't track individual answers.
        if (progress.completed) {
            const { data: inserted, error: insErr } = await supabaseAdmin
                .from('user_progress')
                .insert(payload)
                .select();

            if (insErr) {
                console.error('Progress insert error:', insErr);
                return NextResponse.json({ error: 'DB error' }, { status: 500 });
            }

            return NextResponse.json({ success: true, progress: inserted?.[0] || null });
        } else {
            // For in-progress games, don't create records - only track completion
            return NextResponse.json({ success: true, message: 'In-progress game progress not stored' });
        }
    }

    // For non-game content, use upsert logic
    const { data: existing, error: selErr } = await supabaseAdmin
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', content_type)
        .eq('content_id', content_id)
        .maybeSingle();

    if (selErr) {
        console.error('Progress select error:', selErr);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    if (existing && existing.id) {
        const { data: updated, error: upErr } = await supabaseAdmin
            .from('user_progress')
            .update(payload)
            .eq('id', existing.id)
            .select();

        if (upErr) {
            console.error('Progress update error:', upErr);
            return NextResponse.json({ error: 'DB error' }, { status: 500 });
        }
        return NextResponse.json({ success: true, progress: updated?.[0] || null });
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('user_progress')
      .insert(payload)
      .select();

    if (insErr) {
      console.error('Progress insert error:', insErr);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress: inserted?.[0] || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/user/progress?type=game&contentId=... - fetch progress for user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("type");
    const contentId = searchParams.get("contentId");

    let query = supabaseAdmin.from("user_progress").select("*").eq("user_id", user.id);

    if (contentType) query = query.eq("content_type", contentType);
    if (contentId) query = query.eq("content_id", contentId);

    const { data, error } = await query.order("last_attempt_at", { ascending: false });
    if (error) {
      console.error("Progress fetch error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ progress: data || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
