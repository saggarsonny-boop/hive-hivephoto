'use client'
import { Nav } from '@/components/layout/Nav'
import { UploadZone } from '@/components/upload/UploadZone'
import { UploadQueue } from '@/components/upload/UploadQueue'
import { StorageBar } from '@/components/pricing/StorageBar'
import { useState } from 'react'

interface QueueItem {
  id: string
  filename: string
  status: 'pending' | 'uploading' | 'done' | 'error' | 'duplicate'
  progress: number
  error?: string
  photoId?: string
  isNearDuplicate?: boolean
}

export default function UploadPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Upload Photos</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Photos are analyzed automatically by AI after upload.
        </p>
        <div className="mb-6">
          <StorageBar />
        </div>
        <UploadZone queue={queue} setQueue={setQueue} />
        {queue.length > 0 && <UploadQueue queue={queue} />}
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
