import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { field, value } = await request.json()

    if (!field || !value) {
      return NextResponse.json(
        { error: 'Field and value are required' },
        { status: 400 }
      )
    }

    if (field !== 'username' && field !== 'email') {
      return NextResponse.json(
        { error: 'Invalid field. Must be username or email' },
        { status: 400 }
      )
    }

    // Check if the value already exists in the database
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq(field as 'username' | 'email', value.trim())
      .maybeSingle()

    if (error) {
      console.error('Database error checking availability:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // If data exists, the field is not available
    const available = !data

    return NextResponse.json({
      available,
      field,
      value
    })

  } catch (error) {
    console.error('Check availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
