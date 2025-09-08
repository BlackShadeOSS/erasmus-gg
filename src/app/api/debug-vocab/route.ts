import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    console.log('Current user:', user)

    // Check professions
    const { data: professions, error: profError } = await supabaseAdmin
      .from('professions')
      .select('id, name, name_en, is_active')
      .eq('is_active', true)
    
    console.log('Professions:', { professions, error: profError })

    // Check vocabulary categories
    const { data: categories, error: catError } = await supabaseAdmin
      .from('vocabulary_categories')
      .select('id, name, name_en, profession_id')
    
    console.log('Vocabulary categories:', { categories, error: catError })

    // Check vocabulary count
    const { count: vocabCount, error: vocabCountError } = await supabaseAdmin
      .from('vocabulary')
      .select('*', { count: 'exact', head: true })
    
    console.log('Vocabulary count:', { vocabCount, error: vocabCountError })

    // Check user's selected profession
    if (user) {
      const { data: dbUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, username, selected_profession_id')
        .eq('id', (user as any).id)
        .single()
      
      console.log('User DB state:', { dbUser, error: userError })
      
      if (dbUser?.selected_profession_id) {
        // Check categories for this profession
        const { data: userProfCategories, error: userCatError } = await supabaseAdmin
          .from('vocabulary_categories')
          .select('id, name, name_en')
          .eq('profession_id', dbUser.selected_profession_id)
        
        console.log('Categories for user profession:', { 
          professionId: dbUser.selected_profession_id,
          categories: userProfCategories, 
          error: userCatError 
        })

        if (userProfCategories?.length) {
          const categoryIds = userProfCategories.map(c => c.id)
          const { count: userVocabCount, error: userVocabError } = await supabaseAdmin
            .from('vocabulary')
            .select('*', { count: 'exact', head: true })
            .in('category_id', categoryIds)
          
          console.log('Vocabulary for user profession:', { 
            categoryIds,
            count: userVocabCount, 
            error: userVocabError 
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        user: user ? { id: (user as any).id, username: (user as any).username } : null,
        professions: professions?.length || 0,
        categories: categories?.length || 0,
        totalVocab: vocabCount || 0
      }
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}
