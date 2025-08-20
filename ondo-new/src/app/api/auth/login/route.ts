import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // In a real app, you would validate the credentials against your database
    // This is a mock implementation for demonstration
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください。' },
        { status: 400 }
      )
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock user data - in a real app, this would come from your database
    const user = {
      id: '1',
      name: 'Demo User',
      email: email,
      role: 'admin' as const
    }
    
    // In a real app, you would verify the password hash
    // and generate a proper JWT token
    const token = 'mock-jwt-token'
    
    // Create response with user data
    const response = NextResponse.json({ user })
    
    // Set the token as an HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'ログイン中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
