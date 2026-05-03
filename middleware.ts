// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('__session')?.value || req.cookies.get('firebase-auth-token')?.value

  const protectedPaths = ['/dashboard', '/orders', '/profile', '/checkout']
  const adminPaths = ['/admin/dashboard', '/admin/products', '/admin/orders', '/admin/users', '/admin/settings']

  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAdminRoute = adminPaths.some(p => pathname.startsWith(p))

  // For client-side Firebase auth, redirect without token check
  // (actual auth check happens in each page component)
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/orders/:path*', '/profile/:path*', '/checkout/:path*', '/admin/:path*'],
}
