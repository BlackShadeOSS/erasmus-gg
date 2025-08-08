import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary/by-level?level=1..5&page=&limit=&professionId?
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const level = parseInt(searchParams.get('level') || '0')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const professionId = searchParams.get('professionId') || (user as any).selected_profession_id || (user as any).selectedProfessionId

    if (!level || level < 1 || level > 5) return NextResponse.json({ error: 'level must be 1..5' }, { status: 400 })
    if (!professionId) return NextResponse.json({ success: true, items: [], hint: 'Set profession first', pagination: { page, limit, total: 0, totalPages: 0 } })

    // categories for profession
    const { data: categories } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id')
      .eq('profession_id', professionId)
    const catIds = (categories || []).map(c => c.id)
    if (!catIds.length) return NextResponse.json({ success: true, items: [], pagination: { page, limit, total: 0, totalPages: 0 } })

    const { data: vocab, error: vErr, count } = await supabaseAdmin
      .from('vocabulary')
      .select('*', { count: 'exact' })
      .in('category_id', catIds)
      .eq('difficulty_level', level)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (vErr) return NextResponse.json({ error: 'Failed to load vocabulary' }, { status: 500 })

    // progress
    const ids = (vocab || []).map(v => v.id)
    const { data: prog } = await supabaseAdmin
      .from('user_vocabulary_progress')
      .select('vocabulary_id, mastery_level')
      .eq('user_id', (user as any).id)
      .in('vocabulary_id', ids)
    const pmap: Record<string, number> = {}
    for (const p of prog || []) pmap[p.vocabulary_id] = p.mastery_level ?? 0

    const items = (vocab || []).map(v => ({ ...v, mastery_level: pmap[v.id] ?? 0 }))
    return NextResponse.json({ success: true, items, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0)/limit) } })
  } catch (e) {
    console.error('GET /api/user/vocabulary/by-level error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
