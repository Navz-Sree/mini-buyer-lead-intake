import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for buyer-related pages
  if (pathname.startsWith('/buyers')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If there's no token, redirect to signin
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // If token exists but no user ID, redirect to signin
    if (!token.id) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('callbackUrl', pathname)
      url.searchParams.set('error', 'session_invalid')
      return NextResponse.redirect(url)
    }
  }

  // Check if the request is for API routes that require authentication
  if (pathname.startsWith('/api/buyers')) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // If there's no token, return 401
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    // If token exists but no user ID, return 401
    if (!token.id) {
      return NextResponse.json(
        { error: 'Invalid session - Please sign in again' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/buyers/:path*',
    '/api/buyers/:path*'
  ]
}