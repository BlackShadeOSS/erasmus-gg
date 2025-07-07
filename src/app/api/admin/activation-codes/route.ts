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

    const { data: codes, error } = await supabaseAdmin
      .from('activation_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch activation codes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      codes
    })

  } catch (error) {
    console.error('Admin activation codes error:', error)
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

    const { description, maxUses, expiresAt } = await request.json()

    // Generate a random 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { data: newCode, error } = await supabaseAdmin
      .from('activation_codes')
      .insert({
        code,
        description,
        max_uses: maxUses,
        expires_at: expiresAt || null,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create activation code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      code: newCode
    })

  } catch (error) {
    console.error('Admin create activation code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
