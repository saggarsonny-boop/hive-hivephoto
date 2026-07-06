import Link from 'next/link'

interface Props {
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
        <span className="text-2xl">📷</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-zinc-400 text-sm mb-6 max-w-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          {action.label}
        </Link>
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
