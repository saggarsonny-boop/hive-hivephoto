'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Nav } from '@/components/layout/Nav'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Photo } from '@/lib/types/photo'

interface DupePair {
  newPhoto: Photo
  originalPhoto: Photo | null
}

export default function DuplicatesPage() {
  const [dupes, setDupes] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/duplicates')
      .then((r) => r.json())
      .then((data: { photos: Photo[] }) => setDupes(data.photos ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function action(photoId: string, type: 'keep-new' | 'keep-original' | 'keep-both') {
    setActioning(photoId)
    await fetch(`/api/duplicates/${photoId}/${type}`, { method: 'POST' })
    setDupes((prev) => prev.filter((p) => p.id !== photoId))
    setActioning(null)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Duplicate Review</h1>
        <p className="text-zinc-400 text-sm mb-8">
          These photos are very similar to existing ones. Choose which to keep.
        </p>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && dupes.length === 0 && (
          <EmptyState title="No duplicates" description="No duplicate photos to review." />
        )}

        {!loading && dupes.map((photo) => (
          <div key={photo.id} className="bg-zinc-900 rounded-xl p-6 mb-6 border border-zinc-800">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">New upload</p>
                {photo.thumbUrl && (
                  <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
                    <Image src={photo.thumbUrl} alt="New" fill className="object-cover" />
                  </div>
                )}
                <p className="text-xs text-zinc-500 mt-2">
                  {photo.fileSizeBytes ? `${Math.round(photo.fileSizeBytes / 1024)}KB` : ''}
                  {' · '}
                  {photo.width}×{photo.height}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wide">Existing photo</p>
                {photo.nearDuplicateOf ? (
                  <div className="bg-zinc-800 rounded-lg aspect-video flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">Existing photo</p>
                  </div>
                ) : (
                  <div className="bg-zinc-800 rounded-lg aspect-video flex items-center justify-center">
                    <p className="text-zinc-500 text-sm">Loading...</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => action(photo.id, 'keep-new')}
                disabled={actioning === photo.id}
                className="flex-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Keep New
              </button>
              <button
                onClick={() => action(photo.id, 'keep-original')}
                disabled={actioning === photo.id}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Keep Original
              </button>
              <button
                onClick={() => action(photo.id, 'keep-both')}
                disabled={actioning === photo.id}
                className="flex-1 border border-zinc-600 hover:border-zinc-400 text-zinc-300 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Keep Both
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
