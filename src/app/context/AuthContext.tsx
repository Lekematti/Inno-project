'use client'

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import {
  useSession,
  signOut as nextAuthSignOut,
  signIn as nextAuthSignIn,
} from 'next-auth/react'
import { useRouter } from 'next/navigation'

type User = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)

  // Update user state when session changes
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (session?.user) {
      setUser(session.user as User)
    } else {
      setUser(null)
    }

    setError(null) // Optionally clear error on session change
    setLoading(false)
  }, [session, status])

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null) // Clear error before login
    try {
      // First authenticate with our API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Login failed')
      }

      // Then use NextAuth to establish a session
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      // Force refresh to update session
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : String(error)) // Set error
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setLoading(true)
    try {
      await nextAuthSignOut({ redirect: false })
      setUser(null)
      router.push('/profile')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Registration failed')
      }

      // Auto-login after successful registration
      return login(email, password)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Function to import and use in client components
export function signIn(provider: string, options: Record<string, unknown>) {
  return import('next-auth/react').then(({ signIn }) =>
    signIn(provider, options)
  )
}
