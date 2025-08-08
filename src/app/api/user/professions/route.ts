import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/professions -> list active professions (for user to pick)
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('professions')
      .select('id, name, name_en, description, icon_url')
      .eq('is_active', true)
      .order('name_en', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to load professions' }, { status: 500 })

    return NextResponse.json({ success: true, items: data || [] })
  } catch (e) {
    console.error('GET /api/user/professions error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
