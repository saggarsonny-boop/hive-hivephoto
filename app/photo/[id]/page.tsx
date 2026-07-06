'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Nav } from '@/components/layout/Nav'
import { PhotoDetail } from '@/components/photo/PhotoDetail'
import { PhotoModal } from '@/components/photo/PhotoModal'
import type { Photo, PhotoFace } from '@/lib/types/photo'

export default function PhotoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [faces, setFaces] = useState<PhotoFace[]>([])
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/photos/${id}`).then((r) => r.json()),
      fetch(`/api/photos/${id}/signed-url`).then((r) => r.json()),
    ]).then(([photoData, urlData]: [Photo, { url: string }]) => {
      setPhoto(photoData)
      setSignedUrl(urlData.url ?? null)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Nav />
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Nav />
        <div className="text-center py-24 text-zinc-400">Photo not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <PhotoDetail
          photo={photo}
          faces={faces}
          signedUrl={signedUrl}
          onViewFull={() => setShowModal(true)}
          onPhotoUpdate={setPhoto}
        />
      </main>
      {showModal && signedUrl && (
        <PhotoModal
          src={signedUrl}
          alt={photo.aiTitle ?? photo.userTitle ?? 'Photo'}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
