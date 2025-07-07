import bcrypt from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'your-secret-key')

export interface UserSession {
  id: string
  username: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  fullName?: string
  selectedProfessionId?: string
  [key: string]: any
}

export async function createToken(user: UserSession): Promise<string> {
  return await new SignJWT(user as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserSession
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  
  if (!token) return null
  
  return verifyToken(token.value)
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const token = request.cookies.get('auth-token')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const user = await verifyToken(token.value)
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function authenticateUser(username: string, password: string) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return { success: false, error: 'Invalid username or password' }
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    return { 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        selected_profession_id: user.selected_profession_id
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

export async function validateActivationCode(code: string) {
  try {
    const { data: activationCode, error } = await supabaseAdmin
      .from('activation_codes')
      .select('*')
      .eq('code', code)
      .eq('status', 'active')
      .single()

    if (error || !activationCode) {
      return { success: false, error: 'Invalid activation code' }
    }

    // Check if code has expired
    if (activationCode.expires_at && new Date(activationCode.expires_at) < new Date()) {
      return { success: false, error: 'Activation code has expired' }
    }

    // Check if code has reached max uses
    if (activationCode.used_count >= activationCode.max_uses) {
      return { success: false, error: 'Activation code has reached maximum uses' }
    }

    return { success: true, activationCode }
  } catch (error) {
    console.error('Activation code validation error:', error)
    return { success: false, error: 'Validation failed' }
  }
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  activationCode: string
) {
  try {
    // Validate activation code
    const codeValidation = await validateActivationCode(activationCode)
    if (!codeValidation.success) {
      return { success: false, error: codeValidation.error }
    }

    // Check if username or email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`)
      .single()

    if (existingUser) {
      return { success: false, error: 'Username or email already exists' }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        email,
        password_hash: hashedPassword,
        role: 'student',
        activation_code_id: codeValidation.activationCode!.id
      })
      .select()
      .single()

    if (userError) {
      return { success: false, error: 'Failed to create user' }
    }

    // Update activation code usage
    await supabaseAdmin
      .from('activation_codes')
      .update({ 
        used_count: codeValidation.activationCode!.used_count + 1,
        status: codeValidation.activationCode!.used_count + 1 >= codeValidation.activationCode!.max_uses ? 'used' : 'active'
      })
      .eq('id', codeValidation.activationCode!.id)

    return { success: true, user }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Registration failed' }
  }
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}
