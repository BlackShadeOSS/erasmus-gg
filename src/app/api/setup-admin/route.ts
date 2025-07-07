import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up admin user...')
    
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .eq('username', 'admin')
      .single()
    
    if (existingAdmin) {
      return NextResponse.json({
        status: 'error',
        message: 'Admin user already exists',
        admin: existingAdmin
      }, { status: 400 })
    }
    
    // Hash the password using bcryptjs (compatible with PostgreSQL crypt)
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash('admin123', saltRounds)
    
    // Insert the admin user
    const { data: adminUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'admin',
        email: 'admin@vocenglish.com',
        password_hash: hashedPassword,
        full_name: 'Administrator',
        role: 'admin',
        is_active: true
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Failed to create admin user:', insertError)
      return NextResponse.json({
        status: 'error',
        message: 'Failed to create admin user',
        error: insertError.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Admin user created successfully',
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    })
    
  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to setup admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
