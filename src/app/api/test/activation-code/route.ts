import { NextRequest, NextResponse } from 'next/server'
import { validateActivationCode } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { code, turnstileToken } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Activation code is required' },
        { status: 400 }
      )
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'CAPTCHA verification is required' },
        { status: 400 }
      )
    }

    // Validate Turnstile token
    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: turnstileToken,
      }),
    })

    const turnstileData = await turnstileResponse.json()

    if (!turnstileData.success) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed' },
        { status: 400 }
      )
    }

    const validation = await validateActivationCode(code)
    
    return NextResponse.json({
      success: validation.success,
      error: validation.error,
      activationCode: validation.activationCode
    })

  } catch (error) {
    console.error('Test activation code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all activation codes for debugging
    const { data: codes, error } = await supabaseAdmin
      .from('activation_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch codes', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      codes
    })

  } catch (error) {
    console.error('Test get codes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
