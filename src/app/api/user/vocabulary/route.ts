import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary
// Query params: professionId (optional, default: current user's selected_profession_id),
//               categoryId (optional), level (optional: 1..5), search (optional), page, limit
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    let professionId = searchParams.get('professionId') || ''
    const categoryId = searchParams.get('categoryId')
    const level = searchParams.get('level')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Always fetch profession from DB to ensure we have the latest value
    // Don't rely on JWT token as it may be stale after profession changes
    if (!professionId) {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('selected_profession_id')
        .eq('id', (user as any).id)
        .single()
      professionId = dbUser?.selected_profession_id || ''
    }

    // Debug logging to track profession resolution
    console.log('Debug - profession resolution:', {
      userId: (user as any).id,
      professionFromToken: (user as any).selectedProfessionId || (user as any).selected_profession_id,
      professionFromDB: professionId,
      finalProfessionId: professionId
    })

    // If still no profession, return empty list with hint
    if (!professionId) {
      return NextResponse.json({ success: true, items: [], hint: 'Set user profession or pass ?professionId=', pagination: { page, limit, total: 0, totalPages: 0 } })
    }

    // Get categories for profession
    const { data: categories, error: catErr } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id, name, name_en')
      .eq('profession_id', professionId)

    // Debug logging to understand the issue
    console.log('Debug - vocabulary categories query:', {
      professionId,
      query: `profession_id = ${professionId}`,
      categoriesFound: categories?.length || 0,
      categories: categories?.map(c => ({ id: c.id, name: c.name })) || [],
      error: catErr?.message
    })

    if (catErr) {
      console.error('Fetch categories error:', catErr)
      return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
    }

    const categoryIds = (categories || []).map(c => c.id)
    if (categoryIds.length === 0) {
      return NextResponse.json({ success: true, items: [], hint: 'No vocabulary categories found for this profession - try seeding test data', pagination: { page, limit, total: 0, totalPages: 0 } })
    }

    // Build vocabulary query (without progress join)
    let vocabQuery = supabaseAdmin
      .from('vocabulary')
      .select(`
        *,
        category:vocabulary_categories(id, name, name_en)
      `, { count: 'exact' })
      .in('category_id', categoryIds)
      .order('difficulty_level', { ascending: true })
      .order('created_at', { ascending: false })

    if (categoryId) vocabQuery = vocabQuery.eq('category_id', categoryId)
    if (level) vocabQuery = vocabQuery.eq('difficulty_level', parseInt(level))
    if (search) vocabQuery = vocabQuery.or(`term_en.ilike.%${search}%,term_pl.ilike.%${search}%`)

    const { data: vocab, error: vErr, count } = await vocabQuery.range(offset, offset + limit - 1)

    if (vErr) {
      console.error('Fetch vocabulary error:', vErr)
      return NextResponse.json({ error: 'Failed to load vocabulary' }, { status: 500 })
    }

  // Validate ids are UUIDs to avoid Postgres 22P02 errors when a non-uuid sneaks in
  const ids = (vocab || []).map(v => v.id)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const validIds = ids.filter((id) => typeof id === 'string' && uuidRegex.test(id))
    if (validIds.length !== ids.length) {
      console.warn('Warning - some vocabulary ids were invalid UUIDs and were filtered out', { ids, validIds })
    }

    // Fetch progress for these vocabulary ids for current user
    const progressMap: Record<string, number> = {}
    if (validIds.length) {
      try {
        const { data: progress, error: pErr } = await supabaseAdmin
          .from('user_vocabulary_progress')
          .select('vocabulary_id, mastery_level')
          .eq('user_id', (user as any).id)
          .in('vocabulary_id', validIds)

        if (pErr) {
          console.error('Fetch progress error:', pErr)
        } else {
          for (const p of progress || []) progressMap[p.vocabulary_id] = p.mastery_level ?? 0
        }
      } catch (e) {
        // Catch DB-level errors (e.g., 22P02) and continue with empty progressMap
        console.error('Progress select error:', e)
      }
    }

    // Normalize response with explicit level names
    const items = (vocab || []).map(v => ({
      ...v,
      level_name: ['A1','A2','B1','B2','C1'][Math.max(0, Math.min(4, (v.difficulty_level || 1) - 1))],
      mastery_level: progressMap[v.id] ?? 0
    }))

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (e) {
    console.error('GET /api/user/vocabulary error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/user/vocabulary
// Body: { vocabulary_id: string, delta?: number, mastery_level?: number }
// Increments or sets mastery_level for the current user
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vocabulary_id, delta, mastery_level } = await request.json()
    if (!vocabulary_id) {
      return NextResponse.json({ error: 'vocabulary_id required' }, { status: 400 })
    }

    // Upsert progress
    if (typeof mastery_level === 'number') {
      const lvl = Math.max(0, Math.min(5, mastery_level))
      const { data, error } = await supabaseAdmin
        .from('user_vocabulary_progress')
        .upsert({ user_id: (user as any).id, vocabulary_id, mastery_level: lvl }, { onConflict: 'user_id,vocabulary_id' })
        .select()
      if (error) {
        console.error('Set progress error:', error)
        return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
      }
      return NextResponse.json({ success: true, progress: data?.[0] })
    }

    if (typeof delta === 'number') {
      // Get current
      const { data: cur } = await supabaseAdmin
        .from('user_vocabulary_progress')
        .select('mastery_level')
        .eq('user_id', (user as any).id)
        .eq('vocabulary_id', vocabulary_id)
        .single()

      const newLevel = Math.max(0, Math.min(5, (cur?.mastery_level ?? 0) + delta))
      const { data, error } = await supabaseAdmin
        .from('user_vocabulary_progress')
        .upsert({ user_id: (user as any).id, vocabulary_id, mastery_level: newLevel }, { onConflict: 'user_id,vocabulary_id' })
        .select()
      if (error) {
        console.error('Update progress error:', error)
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
      }
      return NextResponse.json({ success: true, progress: data?.[0] })
    }

    return NextResponse.json({ error: 'Provide delta or mastery_level' }, { status: 400 })
  } catch (e) {
    console.error('PATCH /api/user/vocabulary error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
