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

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('videos')
      .select(`
        *,
        profession:professions(id, name, name_en)
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`title_en.ilike.%${search}%,title.ilike.%${search}%,description_en.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (professionId) {
      query = query.eq('profession_id', professionId)
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('videos')
      .select('*', { count: 'exact', head: true })

    // Get paginated data
    const { data: videos, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      )
    }

    // Map database columns to frontend interface
    const mappedVideos = videos?.map(video => ({
      ...video,
      title_pl: video.title, // Map title to title_pl for frontend
      description_pl: video.description // Map description to description_pl for frontend
    })) || []

    return NextResponse.json({
      success: true,
      videos: mappedVideos,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Admin videos error:', error)
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
      video_url,
      thumbnail_url,
      duration,
      difficulty_level
    } = await request.json()

    if (!profession_id || !title_en || !title_pl || !video_url) {
      return NextResponse.json(
        { error: 'Required fields: profession_id, title_en, title_pl, video_url' },
        { status: 400 }
      )
    }

    const { data: newVideo, error } = await supabaseAdmin
      .from('videos')
      .insert({
        profession_id,
        title: title_pl, // Map title_pl to title column
        title_en,
        description: description_pl, // Map description_pl to description column
        description_en,
        video_url,
        thumbnail_url,
        duration,
        difficulty_level: difficulty_level || 1,
        is_active: true
      })
      .select(`
        *,
        profession:professions(id, name, name_en)
      `)
      .single()

    if (error) {
      console.error('Database error creating video:', error)
      return NextResponse.json(
        { error: 'Failed to create video' },
        { status: 500 }
      )
    }

    // Map database columns to frontend interface
    const mappedVideo = {
      ...newVideo,
      title_pl: newVideo.title, // Map title to title_pl for frontend
      description_pl: newVideo.description // Map description to description_pl for frontend
    }

    return NextResponse.json({
      success: true,
      video: mappedVideo
    })

  } catch (error) {
    console.error('Admin create video error:', error)
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
      video_url,
      thumbnail_url,
      duration,
      difficulty_level,
      is_active
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    const { data: updatedVideo, error } = await supabaseAdmin
      .from('videos')
      .update({
        profession_id,
        title: title_pl, // Map title_pl to title column
        title_en,
        description: description_pl, // Map description_pl to description column
        description_en,
        video_url,
        thumbnail_url,
        duration,
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
      console.error('Database error updating video:', error)
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      )
    }

    // Map database columns to frontend interface
    const mappedVideo = {
      ...updatedVideo,
      title_pl: updatedVideo.title, // Map title to title_pl for frontend
      description_pl: updatedVideo.description // Map description to description_pl for frontend
    }

    return NextResponse.json({
      success: true,
      video: mappedVideo
    })

  } catch (error) {
    console.error('Admin update video error:', error)
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
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })

  } catch (error) {
    console.error('Admin delete video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
