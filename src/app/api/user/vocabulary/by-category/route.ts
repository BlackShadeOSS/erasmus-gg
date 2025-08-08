import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary/by-category?categoryId=...&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!categoryId) return NextResponse.json({ error: 'categoryId required' }, { status: 400 })

    const { data: vocab, error: vErr, count } = await supabaseAdmin
      .from('vocabulary')
      .select('*', { count: 'exact' })
      .eq('category_id', categoryId)
      .order('difficulty_level', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (vErr) return NextResponse.json({ error: 'Failed to load vocabulary' }, { status: 500 })

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

    return NextResponse.json({ success: true, items, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0)/limit) } })
  } catch (e) {
    console.error('GET /api/user/vocabulary/by-category error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
