// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'
import { Adapter } from 'next-auth/adapters'
import { createClient } from '@supabase/supabase-js'

import { getServerSession } from 'next-auth'

// Initialize Supabase client for credential verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    global: {
      headers: {
        Authorization: '',
      },
    },
  }
)

async function initializeSession() {
  const session = await getServerSession(authOptions)
  const supabaseAccessToken = session?.supabaseAccessToken
  if (supabaseAccessToken) {
    await supabase.auth.setSession({
      access_token: supabaseAccessToken,
      refresh_token: '',
    })
  }
}

;(async () => {
  await initializeSession()
})()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'john@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) {
            return null
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || '',
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.email = token.email!
        session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: '/profile', // Custom sign-in page - adjust based on your app
    error: '/profile', // Error page - route users back to profile where login form is shown
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', { code, metadata })
    },
    warn(code) {
      console.warn('NextAuth warning:', code)
    },
    debug(code, metadata) {
      console.debug('NextAuth debug:', { code, metadata })
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
