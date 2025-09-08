import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const professionId = searchParams.get('professionId') || 'df4f10dc-2ced-44f4-ad2b-92a90ff29e3b'
    
    console.log('Testing query with profession ID:', professionId)

    // Test the exact query that's failing
    const { data: categories, error: catErr } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id, name, name_en, profession_id')
      .eq('profession_id', professionId)

    console.log('Query result:', { categories, error: catErr })

    // Also test without the filter to see all categories
    const { data: allCategories, error: allErr } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id, name, name_en, profession_id')

    console.log('All categories:', { allCategories, error: allErr })

    // Test if the profession exists
    const { data: profession, error: profErr } = await supabaseAdmin
      .from('professions')
      .select('id, name, name_en')
      .eq('id', professionId)
      .single()

    console.log('Profession check:', { profession, error: profErr })

    return NextResponse.json({
      success: true,
      debug: {
        professionId,
        categoriesForProfession: categories || [],
        allCategories: allCategories || [],
        profession: profession || null,
        errors: {
          categories: catErr?.message,
          allCategories: allErr?.message,
          profession: profErr?.message
        }
      }
    })
  } catch (error) {
    console.error('Test debug error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
