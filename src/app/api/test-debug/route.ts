import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection with detailed debugging...')
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
    }
    
    console.log('Environment variables:', envCheck)
    
    // Create admin client directly in this endpoint
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )
    
    console.log('Created admin client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Service role key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...')
    
    // Try a simple select first
    console.log('Attempting to query users table...')
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1)
    
    console.log('Query result:', { users, error })
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        },
        envCheck,
        debugInfo: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)
        }
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection working',
      userCount: users?.length || 0,
      envCheck,
      debugInfo: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20)
      }
    })
    
  } catch (error) {
    console.error('Test debug error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
