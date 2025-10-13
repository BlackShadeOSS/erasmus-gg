import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary/random?categoryId=...&limit=20
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // max 100 to prevent abuse

    let professionId = (user as any).selected_profession_id || (user as any).selectedProfessionId

    // Always fetch from DB to get latest profession
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('selected_profession_id')
      .eq('id', (user as any).id)
      .single()
    professionId = dbUser?.selected_profession_id || ''

    if (!professionId) {
      return NextResponse.json({ success: true, items: [], hint: 'Set profession first' })
    }

    let query = supabaseAdmin
      .from('vocabulary')
      .select('id, term_en, term_pl, definition_en, definition_pl, difficulty_level, category_id')

    if (categoryId) {
      // If category specified, use it
      query = query.eq('category_id', categoryId)
    } else {
      // Otherwise, get categories for profession
      const { data: categories } = await supabaseAdmin
        .from('vocabulary_categories')
        .select('id')
        .eq('profession_id', professionId)
      const catIds = (categories || []).map(c => c.id)
      if (!catIds.length) return NextResponse.json({ success: true, items: [] })
      query = query.in('category_id', catIds)
    }

    // Get all matching vocabulary first
    const { data: allVocab, error: vErr } = await query

    if (vErr) return NextResponse.json({ error: 'Failed to load vocabulary' }, { status: 500 })

    // Randomly select 'limit' items
    const vocab = [];
    const available = [...(allVocab || [])];
    for (let i = 0; i < Math.min(limit, available.length); i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      vocab.push(available.splice(randomIndex, 1)[0]);
    }

    // Fetch progress for these vocabulary ids for current user
    const ids = (vocab || []).map(v => v.id)
    const progressMap: Record<string, number> = {}
    if (ids.length) {
      const { data: progress } = await supabaseAdmin
        .from('user_vocabulary_progress')
        .select('vocabulary_id, mastery_level')
        .eq('user_id', (user as any).id)
        .in('vocabulary_id', ids)
      for (const p of progress || []) progressMap[p.vocabulary_id] = p.mastery_level ?? 0
    }

    const items = (vocab || []).map(v => ({
      ...v,
      level_name: ['A1','A2','B1','B2','C1'][Math.max(0, Math.min(4, (v.difficulty_level || 1) - 1))],
      mastery_level: progressMap[v.id] ?? 0
    }))

    return NextResponse.json({ success: true, items })
  } catch (e) {
    console.error('GET /api/user/vocabulary/random error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}