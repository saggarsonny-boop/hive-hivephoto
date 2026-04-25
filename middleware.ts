import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BLOCKED_PATTERNS = [
  /\.env/i,
  /\/administrator\//i,
  /\/brevo\//i,
  /\/\.git/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/phpMyAdmin/i,
  /\/phpmyadmin/i,
  /\.php$/i,
  /\/xmlrpc/i,
  /\/config\./i,
]

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse(null, { status: 404 })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
