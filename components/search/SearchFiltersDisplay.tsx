import type { SearchFilters } from '@/lib/types/search'

interface Props {
  filters: SearchFilters
}

export function SearchFiltersDisplay({ filters }: Props) {
  const chips: string[] = []

  if (filters.dateFrom || filters.dateTo) {
    chips.push(`Date: ${filters.dateFrom ?? ''}–${filters.dateTo ?? ''}`)
  }
  if (filters.location) chips.push(`Location: ${filters.location}`)
  if (filters.personName) chips.push(`Person: ${filters.personName}`)
  if (filters.objects?.length) chips.push(`Objects: ${filters.objects.join(', ')}`)
  if (filters.scenes?.length) chips.push(`Scene: ${filters.scenes.join(', ')}`)
  if (filters.emotions?.length) chips.push(`Mood: ${filters.emotions.join(', ')}`)
  if (filters.freeText) chips.push(`"${filters.freeText}"`)

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span key={chip} className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full">
          {chip}
        </span>
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
