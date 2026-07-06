'use client'
import { PhotoCard } from './PhotoCard'
import { DateGroupHeader } from './DateGroupHeader'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photos: Photo[]
}

function groupByDate(photos: Photo[]): Array<{ date: string; photos: Photo[] }> {
  const groups: Record<string, Photo[]> = {}
  for (const photo of photos) {
    const d = new Date(photo.takenAt)
    const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(photo)
  }
  return Object.entries(groups).map(([date, photos]) => ({ date, photos }))
}

export function GalleryGrid({ photos }: Props) {
  const groups = groupByDate(photos)

  return (
    <div>
      {groups.map((group) => (
        <div key={group.date} className="mb-8">
          <DateGroupHeader date={group.date} count={group.photos.length} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 mt-3">
            {group.photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
