import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: professions, error } = await supabaseAdmin
      .from('professions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch professions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      professions
    })

  } catch (error) {
    console.error('Admin professions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, nameEn, description } = await request.json()

    const { data: newProfession, error } = await supabaseAdmin
      .from('professions')
      .insert({
        name,
        name_en: nameEn,
        description,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create profession' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profession: newProfession
    })

  } catch (error) {
    console.error('Admin create profession error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
