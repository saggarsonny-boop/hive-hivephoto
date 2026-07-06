'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import { FirstVisitCard } from '@/components/shared/FirstVisitCard'
import { AutoDemo } from '@/components/shared/AutoDemo'
import { Nav } from '@/components/layout/Nav'
import type { Photo } from '@/lib/types/photo'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/photos?limit=100')
      .then((r) => r.json())
      .then((data: { photos: Photo[]; total: number }) => {
        setPhotos(data.photos ?? [])
        setTotal(data.total ?? 0)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <FirstVisitCard />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            Your Photos
            {total > 0 && <span className="ml-2 text-zinc-400 text-base font-normal">({total})</span>}
          </h1>
          <Link
            href="/upload"
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            Upload
          </Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-red-400 text-center py-8">{error}</div>
        )}

        {!loading && !error && photos.length === 0 && (
          <EmptyState
            title="No photos yet"
            description="Upload your first photo to get started."
            action={{ label: 'Upload photos', href: '/upload' }}
          />
        )}

        {!loading && !error && photos.length > 0 && (
          <GalleryGrid photos={photos} />
        )}
      </main>
      <AutoDemo />
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
