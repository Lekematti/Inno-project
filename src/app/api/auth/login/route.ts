// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create user data to store in cookie
    const userData = {
      id: data.user?.id,
      email: data.user?.email,
      name: data.user?.user_metadata?.full_name || '',
    }

    // Set cookies - fixed cookie setting
    const cookieStore = cookies()

    // Set authenticated flag cookie
    cookieStore.set('authenticated', 'true', {
      httpOnly: false, // Allow JavaScript to read this
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Set user data cookie
    cookieStore.set('user', JSON.stringify(userData), {
      httpOnly: false, // Allow JavaScript to read this
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Store token in HTTP-only cookie for secure storage
    cookieStore.set('token', data.session?.access_token || '', {
      httpOnly: true, // More secure, JS can't read this
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return NextResponse.json(
      {
        message: 'Login successful',
        user: userData,
        session: {
          token: data.session?.access_token,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
