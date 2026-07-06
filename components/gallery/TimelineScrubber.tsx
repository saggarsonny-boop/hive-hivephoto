'use client'
interface Props {
  dates: string[]
  onJump: (date: string) => void
}

export function TimelineScrubber({ dates, onJump }: Props) {
  if (!dates.length) return null
  const years = [...new Set(dates.map((d) => new Date(d).getFullYear()))].sort((a, b) => b - a)

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-40">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onJump(String(year))}
          className="text-xs text-zinc-500 hover:text-amber-400 transition-colors"
        >
          {year}
        </button>
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
