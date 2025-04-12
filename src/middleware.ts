import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Check for session token using NextAuth
  // const token = await getToken({
  //   req: request,
  //   secret: process.env.NEXTAUTH_SECRET,
  // })
  const authenticatedCookie = request.cookies.get('authenticated')
  const isLoggedIn = authenticatedCookie?.value === 'true'
  console.log('cookie', authenticatedCookie)

  // const isLoggedIn = !!token
  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  // Protected routes should redirect to /profile if not logged in
  if (
    !isAuthPage &&
    !isLoggedIn &&
    request.nextUrl.pathname.startsWith('/build')
  ) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/build'],
}
