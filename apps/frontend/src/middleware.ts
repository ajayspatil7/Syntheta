import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that should be protected (require authentication)
const protectedPaths = ['/dashboard']
// Add paths that should be accessible only to non-authenticated users
const authPaths = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for access token in cookies
  const accessToken = request.cookies.get('access_token')?.value
  // Check for access token in Authorization header
  const authHeader = request.headers.get('authorization')
  const hasValidToken = accessToken || (authHeader && authHeader.startsWith('Bearer '))

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  // Check if the path is an auth path (login/signup)
  const isAuthPath = authPaths.some(path => pathname === path)

  // If trying to access protected path without token, redirect to login
  if (isProtectedPath && !hasValidToken) {
    const url = new URL('/login', request.url)
    // Store the original URL to redirect back after login
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // If trying to access auth paths with token, redirect to dashboard
  if (isAuthPath && hasValidToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For protected paths, add the Authorization header if we have a token
  if (isProtectedPath && accessToken) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${accessToken}`)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 