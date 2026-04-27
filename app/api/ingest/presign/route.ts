import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { presignUpload } from '@/lib/pipeline/presign'
import { env } from '@/lib/env'
import type { PresignRequest } from '@/lib/types/pipeline'

export async function POST(req: Request) {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_ORIGINALS) {
    return NextResponse.json({ error: 'Storage not configured', code: 'R2_MISSING' }, { status: 503 })
  }

  try {
    const userId = await requireUser()
    const body = (await req.json()) as PresignRequest
    const result = await presignUpload(userId, body)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    const message = err instanceof Error ? err.message : String(err)
    const code = (err as { code?: string }).code
    if (code === 'STORAGE_LIMIT') {
      return NextResponse.json({ error: 'Storage limit exceeded', code: 'STORAGE_LIMIT' }, { status: 402 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
