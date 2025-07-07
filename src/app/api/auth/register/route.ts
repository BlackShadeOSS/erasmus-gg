import { NextRequest, NextResponse } from 'next/server'
import { registerUser, verifyTurnstileToken, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('=== REGISTRATION REQUEST START ===')
    const body = await request.json()
    console.log('Raw request body:', body)
    
    const { username, email, password, confirmPassword, activationCode, turnstileToken } = body

    // Debug logging with detailed character analysis
    console.log('Parsed registration data:', {
      username: username || 'MISSING',
      email: email || 'MISSING',
      activationCode: activationCode ? {
        value: `"${activationCode}"`,
        length: activationCode.length,
        type: typeof activationCode,
        chars: activationCode.split('').map((c: string, i: number) => `${i}:"${c}"(${c.charCodeAt(0)})`),
        trimmed: `"${activationCode.trim()}"`,
        upperCase: `"${activationCode.toUpperCase()}"`,
        hasWhitespace: /\s/.test(activationCode)
      } : 'MISSING',
      turnstileToken: turnstileToken ? 'PROVIDED' : 'MISSING',
      allBodyKeys: Object.keys(body)
    })

    if (!username || !email || !password || !confirmPassword || !activationCode || !turnstileToken) {
      const missing = []
      if (!username) missing.push('username')
      if (!email) missing.push('email')
      if (!password) missing.push('password')
      if (!confirmPassword) missing.push('confirmPassword')
      if (!activationCode) missing.push('activationCode')
      if (!turnstileToken) missing.push('turnstileToken')
      
      console.log('Missing fields:', missing)
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Verify Turnstile token
    console.log('=== TURNSTILE VERIFICATION ===')
    console.log('Turnstile token provided:', turnstileToken ? 'YES' : 'NO')
    console.log('About to verify Turnstile token...')
    
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    console.log('Turnstile verification result:', isTurnstileValid)
    
    if (!isTurnstileValid) {
      console.log('FAILURE: CAPTCHA verification failed')
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 }
      )
    }

    console.log('SUCCESS: CAPTCHA verification passed')

    // Register user
    console.log('=== USER REGISTRATION START ===')
    console.log('About to call registerUser with activation code:', `"${activationCode}"`)
    console.log('Activation code character analysis:', {
      raw: activationCode,
      quoted: `"${activationCode}"`,
      length: activationCode.length,
      trimmed: activationCode.trim(),
      chars: activationCode.split('').map((c: string, i: number) => `${i}:"${c}"(${c.charCodeAt(0)})`)
    })
    
    const registerResult = await registerUser(username, email, password, activationCode)
    
    console.log('=== REGISTRATION RESULT ===')
    console.log('Registration result:', {
      success: registerResult.success,
      error: registerResult.error,
      user: registerResult.success ? 'USER_CREATED' : 'NO_USER'
    })
    
    if (!registerResult.success) {
      console.log('FAILURE: Registration failed with error:', registerResult.error)
      return NextResponse.json(
        { error: registerResult.error },
        { status: 400 }
      )
    }

    console.log('SUCCESS: User registration completed')

    // Create JWT token
    console.log('=== TOKEN CREATION ===')
    console.log('Creating JWT token for user:', registerResult.user.username)
    
    const token = await createToken({
      id: registerResult.user.id,
      username: registerResult.user.username,
      email: registerResult.user.email,
      role: registerResult.user.role,
      fullName: registerResult.user.full_name,
      selectedProfessionId: registerResult.user.selected_profession_id
    })
    
    console.log('JWT token created:', token ? 'YES' : 'NO')
    
    // Set auth cookie using the same method as login
    await setAuthCookie(token)
    
    console.log('=== REGISTRATION COMPLETE SUCCESS ===')
    console.log('Redirecting to:', '/dashboard')

    return NextResponse.json({ 
      success: true, 
      user: registerResult.user,
      redirectTo: '/dashboard'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
