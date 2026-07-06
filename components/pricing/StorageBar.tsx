'use client'
import { useEffect, useState } from 'react'
import { formatBytes, storagePercent, isStorageUnlimited } from '@/lib/pricing/storage'
import Link from 'next/link'

export function StorageBar() {
  const [data, setData] = useState<{ usedBytes: string; totalBytes: string } | null>(null)

  useEffect(() => {
    fetch('/api/storage/usage')
      .then((r) => r.json())
      .then((d) => { if (d && !d.error && d.usedBytes != null) setData(d) })
      .catch(() => null)
  }, [])

  if (!data) return null

  const used = BigInt(data.usedBytes)
  const total = BigInt(data.totalBytes)
  const unlimited = isStorageUnlimited(total)
  const pct = unlimited ? 0 : storagePercent(used, total)
  const nearLimit = !unlimited && pct >= 80

  return (
    <div className="text-sm">
      <div className="flex justify-between text-zinc-400 mb-1.5">
        <span>Storage</span>
        <span>
          {formatBytes(used)}
          {unlimited ? ' / Unlimited' : ` / ${formatBytes(total)}`}
        </span>
      </div>
      {!unlimited && (
        <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${nearLimit ? 'bg-red-500' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {nearLimit && (
        <p className="text-xs text-red-400">
          Storage nearly full.{' '}
          <Link href="/pricing" className="underline hover:text-red-300">
            Upgrade
          </Link>
        </p>
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
