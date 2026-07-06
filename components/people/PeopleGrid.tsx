'use client'
import Link from 'next/link'
import Image from 'next/image'
import type { Person } from '@/lib/types/photo'

interface Props {
  people: Person[]
}

export function PeopleGrid({ people }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {people.map((person) => (
        <Link
          key={person.id}
          href={`/people/${person.id}`}
          className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-zinc-700 text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto mb-3 overflow-hidden flex items-center justify-center">
            {person.coverThumbUrl ? (
              <Image src={person.coverThumbUrl} alt={person.name} width={64} height={64} className="object-cover w-full h-full rounded-full" />
            ) : (
              <span className="text-2xl text-zinc-600">
                {person.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <p className="font-medium text-sm truncate">{person.name}</p>
          <p className="text-zinc-500 text-xs mt-0.5">{person.photoCount} photos</p>
        </Link>
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
