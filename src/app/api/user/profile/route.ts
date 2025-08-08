import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch latest user record
    const { data: dbUser, error: userErr } = await supabaseAdmin
      .from('users')
      .select('id, username, email, full_name, role, selected_profession_id, is_active, created_at, updated_at')
      .eq('id', (user as any).id)
      .single()

    if (userErr || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let profession = null as any
    if (dbUser.selected_profession_id) {
      const { data: prof } = await supabaseAdmin
        .from('professions')
        .select('id, name, name_en, description, icon_url, is_active')
        .eq('id', dbUser.selected_profession_id)
        .single()
      profession = prof || null
    }

    return NextResponse.json({ success: true, user: { ...dbUser, profession } })
  } catch (e) {
    console.error('GET /api/user/profile error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, selected_profession_id } = body as {
      full_name?: string
      selected_profession_id?: string | null
    }

    const update: Record<string, any> = {}
    if (typeof full_name !== 'undefined') update.full_name = full_name
    if (typeof selected_profession_id !== 'undefined') update.selected_profession_id = selected_profession_id

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('users')
      .update(update)
      .eq('id', (user as any).id)
      .select('id, username, email, full_name, role, selected_profession_id, is_active, created_at, updated_at')
      .single()

    if (updErr || !updated) {
      console.error('Update profile error:', updErr)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    let profession = null as any
    if (updated.selected_profession_id) {
      const { data: prof } = await supabaseAdmin
        .from('professions')
        .select('id, name, name_en, description, icon_url, is_active')
        .eq('id', updated.selected_profession_id)
        .single()
      profession = prof || null
    }

    return NextResponse.json({ success: true, user: { ...updated, profession } })
  } catch (e) {
    console.error('PUT /api/user/profile error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
