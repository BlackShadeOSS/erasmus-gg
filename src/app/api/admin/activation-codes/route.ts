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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('activation_codes')
      .select(`
        *,
        profession:professions(id, name, name_en)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('activation_codes')
      .select('*', { count: 'exact', head: true })

    // Get paginated data
    const { data: codes, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch activation codes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      codes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
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

    const { description, maxUses, expiresAt, professionId } = await request.json()

    if (!description || !professionId) {
      return NextResponse.json(
        { error: 'Description and profession are required' },
        { status: 400 }
      )
    }

    // Generate a random 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { data: newCode, error } = await supabaseAdmin
      .from('activation_codes')
      .insert({
        code,
        description,
        max_uses: maxUses,
        expires_at: expiresAt || null,
        profession_id: professionId || null,
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, description, maxUses, expiresAt, status, professionId } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Code ID is required' },
        { status: 400 }
      )
    }

    if (!description || !professionId) {
      return NextResponse.json(
        { error: 'Description and profession are required' },
        { status: 400 }
      )
    }

    const { data: updatedCode, error } = await supabaseAdmin
      .from('activation_codes')
      .update({
        description,
        max_uses: maxUses,
        expires_at: expiresAt || null,
        status: status || 'active',
        profession_id: professionId || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update activation code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      code: updatedCode
    })

  } catch (error) {
    console.error('Admin update activation code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Code ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('activation_codes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete activation code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Activation code deleted successfully'
    })

  } catch (error) {
    console.error('Admin delete activation code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
