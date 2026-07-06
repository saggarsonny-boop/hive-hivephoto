'use client'
import Image from 'next/image'

interface Props {
  photoId: string
  thumbUrl: string | null
  onKeepNew: () => void
  onKeepOriginal: () => void
  onKeepBoth: () => void
}

export function DuplicateReview({ photoId, thumbUrl, onKeepNew, onKeepOriginal, onKeepBoth }: Props) {
  return (
    <div className="bg-zinc-900 border border-amber-400/30 rounded-xl p-4 mt-3">
      <p className="text-amber-400 text-sm font-semibold mb-3">Similar photo detected</p>
      {thumbUrl && (
        <div className="relative aspect-video w-32 rounded overflow-hidden mb-3">
          <Image src={thumbUrl} alt="Duplicate" fill className="object-cover" />
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={onKeepNew}
          className="flex-1 bg-amber-400 text-zinc-950 py-1.5 rounded text-xs font-semibold"
        >
          Keep New
        </button>
        <button
          onClick={onKeepOriginal}
          className="flex-1 bg-zinc-700 text-white py-1.5 rounded text-xs font-semibold"
        >
          Keep Original
        </button>
        <button
          onClick={onKeepBoth}
          className="flex-1 border border-zinc-600 text-zinc-300 py-1.5 rounded text-xs font-semibold"
        >
          Keep Both
        </button>
      </div>
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
