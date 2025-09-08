import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary/search?q=...&professionId?=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    let professionId = searchParams.get('professionId') || (user as any).selected_profession_id || (user as any).selectedProfessionId || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Always fetch from DB to get latest profession
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('selected_profession_id')
      .eq('id', (user as any).id)
      .single()
    professionId = professionId || dbUser?.selected_profession_id || ''

    if (!professionId) return NextResponse.json({ success: true, items: [], hint: 'Set profession first', pagination: { page, limit, total: 0, totalPages: 0 } })
    if (!q) return NextResponse.json({ success: true, items: [], pagination: { page, limit, total: 0, totalPages: 0 } })

    const { data: categories } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id')
      .eq('profession_id', professionId)
    const catIds = (categories || []).map(c => c.id)
    if (!catIds.length) return NextResponse.json({ success: true, items: [], pagination: { page, limit, total: 0, totalPages: 0 } })

    const searchQuery = supabaseAdmin
      .from('vocabulary')
      .select('*', { count: 'exact' })
      .in('category_id', catIds)
      .or(`term_en.ilike.%${q}%,term_pl.ilike.%${q}%`)
      .order('difficulty_level', { ascending: true })

    const { data, error, count } = await searchQuery.range(offset, offset + limit - 1)
    if (error) return NextResponse.json({ error: 'Failed to search' }, { status: 500 })

    // progress
    const ids = (data || []).map(v => v.id)
    const { data: prog } = await supabaseAdmin
      .from('user_vocabulary_progress')
      .select('vocabulary_id, mastery_level')
      .eq('user_id', (user as any).id)
      .in('vocabulary_id', ids)
    const pmap: Record<string, number> = {}
    for (const p of prog || []) pmap[p.vocabulary_id] = p.mastery_level ?? 0

    const items = (data || []).map(v => ({ ...v, mastery_level: pmap[v.id] ?? 0 }))

    return NextResponse.json({ success: true, items, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0)/limit) } })
  } catch (e) {
    console.error('GET /api/user/vocabulary/search error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
