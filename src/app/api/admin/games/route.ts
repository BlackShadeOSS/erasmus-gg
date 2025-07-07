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
    const professionId = searchParams.get('professionId') || ''
    const gameType = searchParams.get('gameType') || ''

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('games')
      .select(`
        *,
        profession:professions(id, name, name_en)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`title_en.ilike.%${search}%,title_pl.ilike.%${search}%,description_en.ilike.%${search}%,description_pl.ilike.%${search}%`)
    }

    if (professionId) {
      query = query.eq('profession_id', professionId)
    }

    if (gameType) {
      query = query.eq('game_type', gameType)
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('games')
      .select('*', { count: 'exact', head: true })

    // Get paginated data
    const { data: games, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch games' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      games,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Admin games error:', error)
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

    const {
      profession_id,
      title_en,
      title_pl,
      description_en,
      description_pl,
      game_type,
      game_config,
      difficulty_level
    } = await request.json()

    if (!profession_id || !title_en || !title_pl || !game_type) {
      return NextResponse.json(
        { error: 'Required fields: profession_id, title_en, title_pl, game_type' },
        { status: 400 }
      )
    }

    const { data: newGame, error } = await supabaseAdmin
      .from('games')
      .insert({
        profession_id,
        title_en,
        title_pl,
        description_en,
        description_pl,
        game_type,
        game_config,
        difficulty_level: difficulty_level || 1,
        is_active: true
      })
      .select(`
        *,
        profession:professions(id, name, name_en)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create game' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      game: newGame
    })

  } catch (error) {
    console.error('Admin create game error:', error)
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

    const {
      id,
      profession_id,
      title_en,
      title_pl,
      description_en,
      description_pl,
      game_type,
      game_config,
      difficulty_level,
      is_active
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    const { data: updatedGame, error } = await supabaseAdmin
      .from('games')
      .update({
        profession_id,
        title_en,
        title_pl,
        description_en,
        description_pl,
        game_type,
        game_config,
        difficulty_level: difficulty_level || 1,
        is_active
      })
      .eq('id', id)
      .select(`
        *,
        profession:professions(id, name, name_en)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update game' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      game: updatedGame
    })

  } catch (error) {
    console.error('Admin update game error:', error)
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
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('games')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete game' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Game deleted successfully'
    })

  } catch (error) {
    console.error('Admin delete game error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
