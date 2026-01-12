import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
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
