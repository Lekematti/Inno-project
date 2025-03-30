import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const user = request.cookies.get('authenticated')?.value === 'true' // request.cookies.get('user')
  const isLoggedIn = !!user
  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  if (!isAuthPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/build'],
}
