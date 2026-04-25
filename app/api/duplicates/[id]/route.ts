import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/guards'
import { updateDuplicateReviewStatus } from '@/lib/db/photos'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUser()
    const { id } = await params
    const body = await req.json() as { status: 'kept_new' | 'kept_original' | 'kept_both' }
    if (!body.status) return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    await updateDuplicateReviewStatus(id, userId, body.status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
