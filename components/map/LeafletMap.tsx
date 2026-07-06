'use client'
import { useEffect, useRef } from 'react'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photos: Photo[]
}

export default function LeafletMap({ photos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.0/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView([20, 0], 2)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      for (const photo of photos) {
        if (photo.gpsLat == null || photo.gpsLng == null) continue
        const title = photo.userTitle ?? photo.aiTitle ?? 'Photo'
        const popup = `
          <div style="max-width:200px">
            ${photo.thumbUrl ? `<img src="${photo.thumbUrl}" style="width:100%;border-radius:4px;margin-bottom:6px" />` : ''}
            <p style="margin:0;font-size:12px;font-weight:bold">${title}</p>
            <a href="/photo/${photo.id}" style="font-size:11px;color:#f59e0b">View photo →</a>
          </div>
        `
        L.marker([photo.gpsLat, photo.gpsLng]).addTo(map).bindPopup(popup)
      }

      if (photos.length > 0) {
        const lats = photos.filter((p) => p.gpsLat != null).map((p) => p.gpsLat as number)
        const lngs = photos.filter((p) => p.gpsLng != null).map((p) => p.gpsLng as number)
        if (lats.length) {
          map.fitBounds([
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)],
          ], { padding: [20, 20] })
        }
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.0/dist/leaflet.css"
      />
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
