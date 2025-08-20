import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ success: true })
    
    // Clear the token cookie
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0), // Set to past date to clear
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'ログアウト中にエラーが発生しました。' },
      { status: 500 }
    )
  }
}
