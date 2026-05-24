import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Debug endpoint - mock users data
    const users = [
      { id: 1, name: 'Test User', email: 'test@example.com' },
      { id: 2, name: 'Demo User', email: 'demo@example.com' }
    ]
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length,
      message: 'Debug: All registered users'
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
