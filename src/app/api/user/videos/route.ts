import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/videos?professionId?=&difficulty?=&search?=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    let professionId = searchParams.get('professionId') || (user as any).selected_profession_id || (user as any).selectedProfessionId || ''
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Fallback: read fresh from DB
    if (!professionId) {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('selected_profession_id')
        .eq('id', (user as any).id)
        .single()
      professionId = dbUser?.selected_profession_id || ''
    }

    if (!professionId) {
      return NextResponse.json({ success: true, items: [], hint: 'Set user profession or pass ?professionId=', pagination: { page, limit, total: 0, totalPages: 0 } })
    }

    let query = supabaseAdmin
      .from('videos')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('profession_id', professionId)
      .order('created_at', { ascending: false })

    if (difficulty) query = query.eq('difficulty_level', parseInt(difficulty))
    if (search) query = query.or(`title.ilike.%${search}%,title_en.ilike.%${search}%`)

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Fetch videos error:', error)
      return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      items: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (e) {
    console.error('GET /api/user/videos error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
