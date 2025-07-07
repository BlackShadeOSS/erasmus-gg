import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password, confirmPassword, activationCode, turnstileToken } = await request.json()

    if (!username || !password || !confirmPassword || !activationCode || !turnstileToken) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
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

    // Validate activation code
    const { data: activationCodeData, error: activationError } = await supabase
      .from('activation_codes')
      .select('*')
      .eq('code', activationCode)
      .eq('status', 'active')
      .single()

    if (activationError || !activationCodeData) {
      return NextResponse.json(
        { error: 'Invalid activation code' },
        { status: 400 }
      )
    }

    // Check if activation code has expired
    if (activationCodeData.expires_at && new Date(activationCodeData.expires_at) < new Date()) {
      await supabase
        .from('activation_codes')
        .update({ status: 'expired' })
        .eq('id', activationCodeData.id)
      
      return NextResponse.json(
        { error: 'Activation code has expired' },
        { status: 400 }
      )
    }

    // Check if activation code has reached max uses
    if (activationCodeData.used_count >= activationCodeData.max_uses) {
      await supabase
        .from('activation_codes')
        .update({ status: 'used' })
        .eq('id', activationCodeData.id)
      
      return NextResponse.json(
        { error: 'Activation code has been used' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        email: username + '@vocenglish.com', // Temporary email
        password_hash: hashedPassword,
        activation_code_id: activationCodeData.id,
        role: 'student'
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Update activation code usage
    await supabase
      .from('activation_codes')
      .update({ 
        used_count: activationCodeData.used_count + 1,
        ...(activationCodeData.used_count + 1 >= activationCodeData.max_uses && { status: 'used' })
      })
      .eq('id', activationCodeData.id)

    // Create JWT token
    const token = await createToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.full_name,
      selectedProfessionId: newUser.selected_profession_id
    })

    // Set cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.full_name,
        selectedProfessionId: newUser.selected_profession_id
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
