import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      database: !!process.env.DATABASE_URL,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      r2: !!process.env.R2_BUCKET_ORIGINALS,
      clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      resend: !!process.env.RESEND_API_KEY,
    },
  })
}
