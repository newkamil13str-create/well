// apps/web/middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if ((session.user as any)?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Protect /pesanan routes
  if (pathname.startsWith('/pesanan')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=/pesanan', req.url))
    }
  }

  // Protect /checkout
  if (pathname === '/checkout') {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=/checkout', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/pesanan/:path*', '/checkout'],
}
