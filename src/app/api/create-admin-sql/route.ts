import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating admin user with raw SQL...')
    
    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Use raw SQL to insert admin user, bypassing any RLS issues
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        INSERT INTO public.users (username, email, password_hash, full_name, role, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (username) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW()
        RETURNING id, username, email, role;
      `,
      params: ['admin', 'admin@vocenglish.com', hashedPassword, 'Administrator', 'admin', true]
    })
    
    if (error) {
      console.error('SQL execution failed, trying direct insert:', error)
      
      // Fallback: Try direct table insert with service role
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('users')
        .upsert({
          username: 'admin',
          email: 'admin@vocenglish.com',
          password_hash: hashedPassword,
          full_name: 'Administrator',
          role: 'admin',
          is_active: true
        }, {
          onConflict: 'username'
        })
        .select()
      
      if (insertError) {
        return NextResponse.json({
          status: 'error',
          message: 'Failed to create admin user',
          errors: {
            sql: error.message,
            insert: insertError.message
          }
        }, { status: 500 })
      }
      
      return NextResponse.json({
        status: 'success',
        message: 'Admin user created successfully (direct insert)',
        admin: insertData?.[0]
      })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Admin user created successfully (SQL)',
      admin: data
    })
    
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
