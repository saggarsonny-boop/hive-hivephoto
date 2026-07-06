'use client'
import { PhotoCard } from './PhotoCard'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photos: Photo[]
  loading?: boolean
}

export function PhotoGrid({ photos, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-zinc-900 animate-pulse border border-zinc-800" />
        ))}
      </div>
    )
  }

  if (!photos.length) {
    return (
      <EmptyState
        title="No photos yet"
        description="Upload your first photo to get started."
        action={{ label: 'Upload photos', href: '/upload' }}
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}

export default PhotoGrid



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
