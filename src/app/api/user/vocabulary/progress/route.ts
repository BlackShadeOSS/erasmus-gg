import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary/progress?vocabularyId=... (or omit to get summary)
// - if vocabularyId: returns that item's progress
// - else: returns counts per mastery level for current user's selected profession
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const vocabularyId = searchParams.get('vocabularyId')

    if (vocabularyId) {
      const { data, error } = await supabaseAdmin
        .from('user_vocabulary_progress')
        .select('vocabulary_id, mastery_level')
        .eq('user_id', (user as any).id)
        .eq('vocabulary_id', vocabularyId)
        .single()
      if (error && (error as any).code !== 'PGRST116') {
        return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
      }
      return NextResponse.json({ success: true, progress: data || { vocabulary_id: vocabularyId, mastery_level: 0 } })
    }

    let professionId = (user as any).selected_profession_id || (user as any).selectedProfessionId || ''

    // Always fetch from DB to get latest profession
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('selected_profession_id')
      .eq('id', (user as any).id)
      .single()
    professionId = dbUser?.selected_profession_id || ''

    if (!professionId) {
      return NextResponse.json({ success: true, summary: [] })
    }

    // Get categories for profession
    const { data: categories } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id')
      .eq('profession_id', professionId)

    const categoryIds = (categories || []).map(c => c.id)
    if (categoryIds.length === 0) return NextResponse.json({ success: true, summary: [] })

    // Get all vocabulary IDs in profession
    const { data: vocabIds } = await supabaseAdmin
      .from('vocabulary')
      .select('id')
      .in('category_id', categoryIds)

    const vIds = (vocabIds || []).map(v => v.id)
    if (vIds.length === 0) return NextResponse.json({ success: true, summary: [] })

    // Get progress for those ids. If the list is large, query in batches to avoid long URL / payload issues
    const batchSize = 500
    let progress: any[] = []
    for (let i = 0; i < vIds.length; i += batchSize) {
      const batch = vIds.slice(i, i + batchSize)
      const { data: part, error: pErr } = await supabaseAdmin
        .from('user_vocabulary_progress')
        .select('mastery_level')
        .eq('user_id', (user as any).id)
        .in('vocabulary_id', batch)

      if (pErr) {
        console.error('Progress summary error (batch):', pErr)
        return NextResponse.json({ error: 'Failed to load summary' }, { status: 500 })
      }
      progress = progress.concat(part || [])
    }

    const counts = [0,0,0,0,0,0] // 0..5
    for (const p of progress || []) counts[p.mastery_level ?? 0]++

    const summary = counts.map((count, level) => ({ level, count }))
    return NextResponse.json({ success: true, summary })
  } catch (e) {
    console.error('GET /api/user/vocabulary/progress error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
