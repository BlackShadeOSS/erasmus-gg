import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, activationCode } = await request.json()

    console.log('=== TEST REGISTRATION (NO CAPTCHA) ===')
    console.log('Received data:', {
      username,
      email,
      activationCode: `"${activationCode}"`,
      activationCodeLength: activationCode?.length
    })

    if (!username || !email || !password || !activationCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Register user (bypassing Turnstile)
    const registerResult = await registerUser(username, email, password, activationCode)
    
    console.log('Test registration result:', registerResult)
    
    if (!registerResult.success) {
      return NextResponse.json(
        { error: registerResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      user: registerResult.user,
      message: 'Test registration successful (no session created)'
    })
  } catch (error) {
    console.error('Test registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
