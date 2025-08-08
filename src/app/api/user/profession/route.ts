import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/user/profession -> current user's selected profession details
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: dbUser, error: userErr } = await supabaseAdmin
      .from('users')
      .select('selected_profession_id')
      .eq('id', (user as any).id)
      .single()

    if (userErr || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let profession = null as any
    if (dbUser.selected_profession_id) {
      const { data: prof, error: pErr } = await supabaseAdmin
        .from('professions')
        .select('id, name, name_en, description, icon_url, is_active')
        .eq('id', dbUser.selected_profession_id)
        .single()
      if (pErr) {
        return NextResponse.json({ error: 'Failed to fetch profession' }, { status: 500 })
      }
      profession = prof
    }

    return NextResponse.json({ success: true, selected_profession_id: dbUser.selected_profession_id, profession })
  } catch (e) {
    console.error('GET /api/user/profession error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/user/profession -> set current user's profession
// Body: { profession_id: string }
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { profession_id } = await request.json()
    if (!profession_id) {
      return NextResponse.json({ error: 'profession_id required' }, { status: 400 })
    }

    // Ensure profession exists and active
    const { data: prof, error: pErr } = await supabaseAdmin
      .from('professions')
      .select('id, is_active')
      .eq('id', profession_id)
      .eq('is_active', true)
      .single()

    if (pErr || !prof) {
      return NextResponse.json({ error: 'Invalid profession' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ selected_profession_id: profession_id })
      .eq('id', (user as any).id)
      .select('id, selected_profession_id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update profession' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...data })
  } catch (e) {
    console.error('PUT /api/user/profession error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
