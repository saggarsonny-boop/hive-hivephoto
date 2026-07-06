'use client'
import { useEffect, useState } from 'react'
import { Nav } from '@/components/layout/Nav'
import { MapView } from '@/components/map/MapView'
import type { Photo } from '@/lib/types/photo'

export default function MapPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch all photos and filter client-side for those with GPS
    fetch('/api/photos?limit=1000')
      .then((r) => r.json())
      .then((data: { photos: Photo[] }) => {
        setPhotos((data.photos ?? []).filter((p) => p.gpsLat != null && p.gpsLng != null))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Photo Map</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {loading ? 'Loading...' : `${photos.length} geotagged photos`}
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-zinc-800 h-[600px]">
            <MapView photos={photos} />
          </div>
        )}
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
