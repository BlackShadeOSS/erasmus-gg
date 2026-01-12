import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    console.log('Testing database connection...')
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.JWT_SECRET
    }
    
    console.log('Environment variables:', envCheck)
    
    // Test querying all users first
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select('id, username, email, role, is_active')
      .limit(10)
    
    console.log('All users query result:', { allUsers, allUsersError })
    
    // Test querying admin users specifically
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id, username, email, role')
      .eq('role', 'admin')
      .limit(5)
    
    console.log('Admin users query result:', { adminUsers, adminError })
    
    // Test querying for specific admin username
    const { data: adminByUsername, error: usernameError } = await supabaseAdmin
      .from('users')
      .select('id, username, email, role, is_active, password_hash')
      .eq('username', 'admin')
      .single()
    
    console.log('Admin by username result:', { adminByUsername, usernameError })
    
    if (allUsersError && adminError) {
      console.error('Database errors:', { allUsersError, adminError })
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        errors: { allUsersError: allUsersError.message, adminError: adminError.message },
        envCheck
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      totalUsers: allUsers?.length || 0,
      adminUsers: adminUsers?.length || 0,
      adminFound: !!adminByUsername,
      envCheck,
      allUsers: allUsers?.map(u => ({ username: u.username, role: u.role, active: u.is_active })),
      adminDetails: adminByUsername ? {
        username: adminByUsername.username,
        role: adminByUsername.role,
        active: adminByUsername.is_active,
        hasPassword: !!adminByUsername.password_hash
      } : null,
      errors: {
        allUsers: allUsersError?.message,
        admin: adminError?.message,
        username: usernameError?.message
      }
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
