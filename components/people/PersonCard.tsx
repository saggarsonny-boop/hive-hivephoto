'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Person } from '@/lib/types/photo'

interface Props {
  person: Person
}

export default function PersonCard({ person }: Props) {
  return (
    <Link href={`/people/${person.id}`} className="group block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto mb-3 overflow-hidden flex items-center justify-center">
          {person.coverThumbUrl ? (
            <Image
              src={person.coverThumbUrl}
              alt={person.name}
              width={64}
              height={64}
              className="object-cover w-full h-full rounded-full"
            />
          ) : (
            <span className="text-2xl text-zinc-600">
              {person.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <p className="font-medium text-sm truncate">{person.name}</p>
        <p className="text-zinc-500 text-xs mt-0.5">{person.photoCount} photos</p>
      </div>
    </Link>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
