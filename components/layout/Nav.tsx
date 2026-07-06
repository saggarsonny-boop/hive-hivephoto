'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Gallery' },
  { href: '/search', label: 'Search' },
  { href: '/people', label: 'People' },
  { href: '/map', label: 'Map' },
  { href: '/duplicates', label: 'Duplicates' },
]

export function Nav() {
  const path = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-amber-400 text-lg">
            HivePhoto
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  path === item.href
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
          >
            Upload
          </Link>
        </div>
      </div>
    </nav>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
