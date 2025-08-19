import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check all professions
    const { data: professions } = await supabaseAdmin
      .from('professions')
      .select('*')

    // Check all vocabulary categories
    const { data: categories } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('*, profession:professions(name, name_en)')

    // Check vocabulary count by category
    const { data: vocabByCat } = await supabaseAdmin
      .from('vocabulary')
      .select('category_id')
    
    const vocabCounts = vocabByCat?.reduce((acc: Record<string, number>, item) => {
      acc[item.category_id] = (acc[item.category_id] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      data: {
        professions: professions || [],
        categories: categories || [],
        vocabularyCounts: vocabCounts,
        stats: {
          totalProfessions: professions?.length || 0,
          totalCategories: categories?.length || 0,
          totalVocabulary: vocabByCat?.length || 0
        }
      }
    })
  } catch (error) {
    console.error('Database overview error:', error)
    return NextResponse.json({ error: 'Failed to get overview' }, { status: 500 })
  }
}
