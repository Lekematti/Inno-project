import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthState,
} from '../../functions/auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        // In a real app, you'd verify token with your backend
        const userJson = localStorage.getItem('user')
        if (userJson) {
          const user = JSON.parse(userJson)
          setAuthState({ user, isLoading: false, error: null })
        } else {
          setAuthState({ user: null, isLoading: false, error: null })
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Failed to authenticate',
        })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setAuthState({ ...authState, isLoading: true, error: null })
    try {
      // In a real app, you'd make an API call to your backend
      // This is a mock implementation
      if (
        credentials.email === 'test@example.com' &&
        credentials.password === 'password'
      ) {
        const user: User = {
          id: '1',
          email: credentials.email,
          name: 'Test User',
        }

        // Store user in localStorage (use a more secure method in production)
        localStorage.setItem('user', JSON.stringify(user))
        // WIP testing fix for login cookies
        document.cookie = 'authenticated=true; path=/'

        setAuthState({ user, isLoading: false, error: null })
        router.push('/profile')
      } else {
        setAuthState({
          ...authState,
          isLoading: false,
          error: 'Invalid credentials',
        })
      }
    } catch (error) {
      setAuthState({ ...authState, isLoading: false, error: 'Login failed' })
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setAuthState({ ...authState, isLoading: true, error: null })
    try {
      // In a real app, you'd make an API call to your backend
      // This is a mock implementation
      if (credentials.email && credentials.password && credentials.name) {
        const user: User = {
          id: '1',
          email: credentials.email,
          name: credentials.name,
        }

        // Store user in localStorage (use a more secure method in production)
        localStorage.setItem('user', JSON.stringify(user))
        // WIP testing fix for login cookies
        document.cookie = 'authenticated=true; path=/'

        setAuthState({ user, isLoading: false, error: null })
        router.push('/profile')
      } else {
        setAuthState({
          ...authState,
          isLoading: false,
          error: 'Invalid registration data',
        })
      }
    } catch (error) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: 'Registration failed',
      })
    }
  }

  const logout = async () => {
    setAuthState({ ...authState, isLoading: true })
    try {
      // Clear user from localStorage
      localStorage.removeItem('user')
      // WIP testing fix for login cookies
      document.cookie = 'authenticated=false; path=/'

      setAuthState({ user: null, isLoading: false, error: null })
      router.push('/profile')
    } catch (error) {
      setAuthState({ ...authState, isLoading: false, error: 'Logout failed' })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
