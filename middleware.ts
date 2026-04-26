import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

let handler: (req: NextRequest) => Response | NextResponse | Promise<Response | NextResponse>

if (clerkKey && clerkKey.length > 10) {
  const { clerkMiddleware, createRouteMatcher } = require('@clerk/nextjs/server')
  const isPublic = createRouteMatcher([
    '/',
    '/pricing',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/_next/(.*)',
    '/favicon.ico',
  ])
  handler = clerkMiddleware(async (auth: any, req: NextRequest) => {
    if (!isPublic(req)) await auth.protect()
  })
} else {
  handler = (_req: NextRequest) => NextResponse.next()
}

export default handler

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}
