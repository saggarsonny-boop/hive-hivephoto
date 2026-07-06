'use client'
import { useEffect, useState } from 'react'

const DEMO_QUERY = 'Three weeks of morning headaches, worse on waking, easing by midday. Also noticing some neck stiffness.'
const DEMO_RESPONSE = 'Identified: 47 photos with similar lighting in your gallery. Top result: "Morning hike — Pacific Crest Trail" (June 2023). Also found: 3 beach sunsets, 12 golden hour portraits. Try: "photos of my dog" or "birthday parties 2022"'

export function AutoDemo() {
  const [show, setShow] = useState(false)
  const [typed, setTyped] = useState('')
  const [showResponse, setShowResponse] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const key = 'hive_demo_hivephoto'
    if (localStorage.getItem(key)) return
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!show || dismissed) return
    let i = 0
    const interval = setInterval(() => {
      if (i <= DEMO_QUERY.length) {
        setTyped(DEMO_QUERY.slice(0, i))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowResponse(true), 500)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [show, dismissed])

  useEffect(() => {
    if (!showResponse) return
    const timer = setTimeout(() => {
      localStorage.setItem('hive_demo_hivephoto', '1')
      setShow(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [showResponse])

  function dismiss() {
    localStorage.setItem('hive_demo_hivephoto', '1')
    setDismissed(true)
    setShow(false)
  }

  if (!show || dismissed) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-xl max-w-xs w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">Search demo</span>
        <button onClick={dismiss} className="text-zinc-500 hover:text-white text-xs">✕</button>
      </div>
      <div className="bg-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 min-h-[2.5rem] mb-3">
        {typed}
        <span className="animate-pulse">|</span>
      </div>
      {showResponse && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 text-xs text-zinc-300">
          {DEMO_RESPONSE}
        </div>
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
