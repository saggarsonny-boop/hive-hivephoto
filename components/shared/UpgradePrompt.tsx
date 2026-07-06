'use client'
import Link from 'next/link'

interface Props {
  message: string
  onDismiss: () => void
}

export function UpgradePrompt({ message, onDismiss }: Props) {
  return (
    <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-4 flex items-center justify-between">
      <div>
        <p className="text-amber-400 font-semibold text-sm">{message}</p>
        <p className="text-zinc-400 text-xs mt-0.5">Upgrade to get more storage.</p>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <Link
          href="/pricing"
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
        >
          Upgrade
        </Link>
        <button onClick={onDismiss} className="text-zinc-500 hover:text-white text-xs">
          ✕
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
