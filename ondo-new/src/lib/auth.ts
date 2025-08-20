import { cookies } from 'next/headers'

type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export async function login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  // In a real app, you would make an API call to your backend
  // This is a mock implementation for demonstration
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock user data - in a real app, this would come from your backend
    const mockUser: User = {
      id: '1',
      name: 'Demo User',
      email: email,
      role: 'admin'
    }
    
    // In a real app, the cookie would be set by the API route
    // This is just for demonstration
    console.log('Login successful for:', email)
    
    return { user: mockUser, error: null }
  } catch (error) {
    console.error('Login error:', error)
    return { user: null, error: 'ログインに失敗しました。もう一度お試しください。' }
  }
}

export async function logout(): Promise<void> {
  // In a real app, the cookie would be cleared by the API route
  console.log('Logout')
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    return null
  }
  
  try {
    // In a real app, you would validate the token with your backend
    // and get the current user's data
    // This is a mock implementation
    return {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'admin' as const
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('認証が必要です。')
  }
  
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('認証が必要です。')
  }
  
  if (user.role !== 'admin') {
    throw new Error('この操作を実行する権限がありません。')
  }
  
  return user
}
