import { NextRequest, NextResponse } from 'next/server'
import { validateActivationCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { activationCode } = await request.json()
    
    console.log('=== SIMPLE CODE VALIDATION TEST ===')
    console.log('Received activation code:', {
      value: activationCode,
      type: typeof activationCode,
      length: activationCode?.length,
      stringified: JSON.stringify(activationCode)
    })

    const result = await validateActivationCode(activationCode)
    
    console.log('Validation result:', result)
    
    return NextResponse.json({
      success: result.success,
      error: result.error,
      received: activationCode,
      type: typeof activationCode,
      length: activationCode?.length
    })
  } catch (error) {
    console.error('Test validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
