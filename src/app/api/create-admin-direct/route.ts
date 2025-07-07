import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating admin user via SQL...')
    
    // Try to create admin user using raw SQL
    const { data, error } = await supabaseAdmin.rpc('sql', {
      query: `
        INSERT INTO public.users (username, email, password_hash, full_name, role, is_active) 
        VALUES ('admin', 'admin@vocenglish.com', '$2b$10$v0PIAOL0Jl50NKA7HI2FYeY59eZPsN1txCdp./6/GsXFbtcOVVWIq', 'Administrator', 'admin', true)
        ON CONFLICT (username) DO NOTHING
        RETURNING id, username, email, role;
      `
    })
    
    if (error) {
      console.error('SQL insertion failed:', error)
      
      // Fallback: Try to use a more direct approach
      const { data: directData, error: directError } = await supabaseAdmin
        .from('users')
        .upsert({
          username: 'admin',
          email: 'admin@vocenglish.com',
          password_hash: '$2b$10$v0PIAOL0Jl50NKA7HI2FYeY59eZPsN1txCdp./6/GsXFbtcOVVWIq',
          full_name: 'Administrator',
          role: 'admin',
          is_active: true
        }, {
          onConflict: 'username',
          ignoreDuplicates: true
        })
        .select()
      
      if (directError) {
        return NextResponse.json({
          status: 'error',
          message: 'Failed to create admin user',
          errors: {
            sql: error.message,
            direct: directError.message
          }
        }, { status: 500 })
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'Admin user created via direct insert',
        admin: directData
      })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Admin user created via SQL',
      result: data
    })
    
  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
