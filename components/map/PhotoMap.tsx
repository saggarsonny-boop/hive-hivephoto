'use client'
import { MapView } from './MapView'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photos: Photo[]
}

export default function PhotoMap({ photos }: Props) {
  const geoPhotos = photos.filter((p) => p.gpsLat != null && p.gpsLng != null)

  if (!geoPhotos.length) {
    return (
      <div className="h-96 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-3 text-center p-8">
        <p className="text-white font-medium">No geotagged photos</p>
        <p className="text-sm text-zinc-400 max-w-xs">
          Photos with GPS data embedded in their EXIF will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="h-96 rounded-xl overflow-hidden border border-zinc-800">
      <MapView photos={geoPhotos} />
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
