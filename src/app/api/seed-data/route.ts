import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database seeding...')

    // First, check if we already have professions
    const { data: existingProfs } = await supabaseAdmin
      .from('professions')
      .select('id')
      .limit(1)

    if (existingProfs && existingProfs.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Data already exists, skipping seed' 
      })
    }

    // Create sample professions
    const { data: professions, error: profError } = await supabaseAdmin
      .from('professions')
      .insert([
        {
          name: 'Programista',
          name_en: 'Programmer',
          description: 'Specjalista od tworzenia oprogramowania',
          is_active: true
        },
        {
          name: 'Kucharz',
          name_en: 'Chef',
          description: 'Specjalista od sztuki kulinarnej',
          is_active: true
        },
        {
          name: 'Mechanik',
          name_en: 'Mechanic',
          description: 'Specjalista od naprawy pojazdów',
          is_active: true
        }
      ])
      .select()

    if (profError) {
      console.error('Error creating professions:', profError)
      return NextResponse.json({ error: 'Failed to create professions' }, { status: 500 })
    }

    console.log('Created professions:', professions)

    // Create vocabulary categories for programmer
    const programmerId = professions.find(p => p.name_en === 'Programmer')?.id
    if (programmerId) {
      const { data: categories, error: catError } = await supabaseAdmin
        .from('vocabulary_categories')
        .insert([
          {
            profession_id: programmerId,
            name: 'Podstawy programowania',
            name_en: 'Programming Basics',
            description: 'Podstawowe terminy programistyczne',
            order_index: 1
          },
          {
            profession_id: programmerId,
            name: 'Struktury danych',
            name_en: 'Data Structures',
            description: 'Struktury danych w programowaniu',
            order_index: 2
          },
          {
            profession_id: programmerId,
            name: 'Web Development',
            name_en: 'Web Development',
            description: 'Tworzenie aplikacji internetowych',
            order_index: 3
          }
        ])
        .select()

      if (catError) {
        console.error('Error creating categories:', catError)
        return NextResponse.json({ error: 'Failed to create categories' }, { status: 500 })
      }

      console.log('Created categories:', categories)

      // Create sample vocabulary for the first category
      const basicsCategoryId = categories.find(c => c.name_en === 'Programming Basics')?.id
      if (basicsCategoryId) {
        const { data: vocabulary, error: vocabError } = await supabaseAdmin
          .from('vocabulary')
          .insert([
            {
              category_id: basicsCategoryId,
              term_en: 'Variable',
              term_pl: 'Zmienna',
              definition_en: 'A storage location with an associated name',
              definition_pl: 'Miejsce w pamięci z przypisaną nazwą',
              example_sentence_en: 'Declare a variable to store the user input',
              example_sentence_pl: 'Zadeklaruj zmienną do przechowania danych użytkownika',
              difficulty_level: 1
            },
            {
              category_id: basicsCategoryId,
              term_en: 'Function',
              term_pl: 'Funkcja',
              definition_en: 'A block of code that performs a specific task',
              definition_pl: 'Blok kodu wykonujący określone zadanie',
              example_sentence_en: 'Call the function to process the data',
              example_sentence_pl: 'Wywołaj funkcję aby przetworzyć dane',
              difficulty_level: 2
            },
            {
              category_id: basicsCategoryId,
              term_en: 'Algorithm',
              term_pl: 'Algorytm',
              definition_en: 'A step-by-step procedure for solving a problem',
              definition_pl: 'Krok po kroku procedura rozwiązania problemu',
              example_sentence_en: 'The sorting algorithm is very efficient',
              example_sentence_pl: 'Algorytm sortowania jest bardzo wydajny',
              difficulty_level: 3
            },
            {
              category_id: basicsCategoryId,
              term_en: 'Database',
              term_pl: 'Baza danych',
              definition_en: 'A structured collection of data',
              definition_pl: 'Uporządkowany zbiór danych',
              example_sentence_en: 'Store user information in the database',
              example_sentence_pl: 'Przechowuj informacje o użytkownikach w bazie danych',
              difficulty_level: 2
            },
            {
              category_id: basicsCategoryId,
              term_en: 'API',
              term_pl: 'API',
              definition_en: 'Application Programming Interface',
              definition_pl: 'Interfejs programowania aplikacji',
              example_sentence_en: 'Use the REST API to fetch data',
              example_sentence_pl: 'Użyj REST API do pobrania danych',
              difficulty_level: 4
            }
          ])
          .select()

        if (vocabError) {
          console.error('Error creating vocabulary:', vocabError)
          return NextResponse.json({ error: 'Failed to create vocabulary' }, { status: 500 })
        }

        console.log('Created vocabulary:', vocabulary)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        professions: professions.length,
        programmerId
      }
    })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 })
  }
}
