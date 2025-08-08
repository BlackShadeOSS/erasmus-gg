import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/vocabulary/categories?professionId=...
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    let professionId = searchParams.get('professionId') || (user as any).selected_profession_id || (user as any).selectedProfessionId || ''

    if (!professionId) {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('selected_profession_id')
        .eq('id', (user as any).id)
        .single()
      professionId = dbUser?.selected_profession_id || ''
    }

    if (!professionId) {
      return NextResponse.json({ success: true, items: [] })
    }

    const { data, error } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id, name, name_en, description, order_index')
      .eq('profession_id', professionId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Fetch categories error:', error)
      return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 })
    }

    return NextResponse.json({ success: true, items: data || [] })
  } catch (e) {
    console.error('GET /api/user/vocabulary/categories error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
