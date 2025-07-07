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
      .from('professions')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('professions')
      .select('*', { count: 'exact', head: true })

    // Get paginated data
    const { data: professions, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch professions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      professions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, name, nameEn, description, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Profession ID is required' },
        { status: 400 }
      )
    }

    const { data: updatedProfession, error } = await supabaseAdmin
      .from('professions')
      .update({
        name,
        name_en: nameEn,
        description,
        is_active: isActive
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profession' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profession: updatedProfession
    })

  } catch (error) {
    console.error('Admin update profession error:', error)
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
        { error: 'Profession ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('professions')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete profession' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profession deleted successfully'
    })

  } catch (error) {
    console.error('Admin delete profession error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
