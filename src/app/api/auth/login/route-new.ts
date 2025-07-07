import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password, turnstileToken } = await request.json()

    if (!username || !password || !turnstileToken) {
      return NextResponse.json(
        { error: 'Username, password, and CAPTCHA are required' },
        { status: 400 }
      )
    }

    // Verify Turnstile token
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY!,
          response: turnstileToken,
        }),
      }
    )

    const turnstileData = await turnstileResponse.json()
    
    if (!turnstileData.success) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed' },
        { status: 400 }
      )
    }

    // Authenticate user
    const authResult = await authenticateUser(username, password)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await createToken({
      id: authResult.user.id,
      username: authResult.user.username,
      email: authResult.user.email,
      role: authResult.user.role,
      fullName: authResult.user.full_name,
      selectedProfessionId: authResult.user.selected_profession_id
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
        role: authResult.user.role,
        fullName: authResult.user.full_name,
        selectedProfessionId: authResult.user.selected_profession_id
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
