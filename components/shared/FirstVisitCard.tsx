'use client'
import { useEffect, useState } from 'react'

export function FirstVisitCard() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const key = 'hive_welcomed_hivephoto'
    if (!localStorage.getItem(key)) {
      setShow(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('hive_welcomed_hivephoto', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-amber-400/30 rounded-2xl p-5 shadow-xl max-w-sm w-full mx-4">
      <p className="text-white font-semibold text-sm mb-2">Your private AI photo library</p>
      <p className="text-zinc-400 text-xs mb-4">
        Upload photos. AI tags, searches, and finds faces automatically.
      </p>
      <button
        onClick={dismiss}
        className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        Try it — upload a photo
      </button>
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
