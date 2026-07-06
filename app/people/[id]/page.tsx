'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { PhotoCard } from '@/components/gallery/PhotoCard'
import type { Person, Photo } from '@/lib/types/photo'

export default function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const [person, setPerson] = useState<Person | null>(null)
  const [photoIds, setPhotoIds] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/people/${id}`)
      .then((r) => r.json())
      .then(async (data: { person: Person; photoIds: string[] }) => {
        setPerson(data.person)
        setPhotoIds(data.photoIds ?? [])
        // Fetch photos
        const photoPromises = (data.photoIds ?? []).slice(0, 50).map((pid) =>
          fetch(`/api/photos/${pid}`).then((r) => r.json() as Promise<Photo>)
        )
        const fetched = await Promise.all(photoPromises)
        setPhotos(fetched.filter(Boolean))
      })
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/people" className="text-zinc-400 hover:text-white text-sm">
            ← People
          </Link>
          {person && (
            <h1 className="text-2xl font-bold">{person.name}</h1>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
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
