import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary/recommended?limit=20
// Simple heuristic: lowest mastery first, then by difficulty asc
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
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

    // categories for profession
    const { data: categories } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id')
      .eq('profession_id', professionId)
    const catIds = (categories || []).map(c => c.id)
    if (!catIds.length) return NextResponse.json({ success: true, items: [] })

    // Fetch candidate vocab
    const { data: vocab, error: vErr } = await supabaseAdmin
      .from('vocabulary')
      .select('id, term_en, term_pl, difficulty_level')
      .in('category_id', catIds)
      .order('difficulty_level', { ascending: true })
      .limit(200)

    if (vErr) return NextResponse.json({ error: 'Failed to load vocabulary' }, { status: 500 })

    const ids = (vocab || []).map(v => v.id)
    const { data: prog } = await supabaseAdmin
      .from('user_vocabulary_progress')
      .select('vocabulary_id, mastery_level')
      .eq('user_id', (user as any).id)
      .in('vocabulary_id', ids)

    const pmap: Record<string, number> = {}
    for (const p of prog || []) pmap[p.vocabulary_id] = p.mastery_level ?? 0

    const ranked = (vocab || [])
      .map(v => ({ ...v, mastery_level: pmap[v.id] ?? 0 }))
      .sort((a,b) => (a.mastery_level - b.mastery_level) || (a.difficulty_level - b.difficulty_level))
      .slice(0, limit)

    return NextResponse.json({ success: true, items: ranked })
  } catch (e) {
    console.error('GET /api/user/vocabulary/recommended error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
