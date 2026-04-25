import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sql } from '@/lib/db/client'

// One-shot Stripe product/price seeder. Protected by CRON_SECRET.
// Hit POST /api/admin/seed-stripe once after Stripe key is set.
// Creates all HivePhoto products, updates pricing_tiers with stripe_price_id.

const PRODUCTS = [
  {
    tierName: 'founding_patron_monthly',
    productName: 'HivePhoto Founding Patron',
    description: 'Founding member tier — 2 TB storage, early access, locked-in rate',
    unitAmount: 399,
    interval: 'month' as const,
    intervalCount: 1,
  },
  {
    tierName: 'patron_monthly',
    productName: 'HivePhoto Patron',
    description: 'Patron monthly — 2 TB storage',
    unitAmount: 499,
    interval: 'month' as const,
    intervalCount: 1,
  },
  {
    tierName: 'patron_annual',
    productName: 'HivePhoto Patron (Annual)',
    description: 'Patron annual — 2 TB storage, 2 months free',
    unitAmount: 4788,
    interval: 'year' as const,
    intervalCount: 1,
  },
  {
    tierName: 'founding_sovereign_monthly',
    productName: 'HivePhoto Founding Sovereign',
    description: 'Founding Sovereign — unlimited storage, priority AI, locked-in rate',
    unitAmount: 999,
    interval: 'month' as const,
    intervalCount: 1,
  },
  {
    tierName: 'sovereign_monthly',
    productName: 'HivePhoto Sovereign',
    description: 'Sovereign monthly — unlimited storage, priority AI processing',
    unitAmount: 1299,
    interval: 'month' as const,
    intervalCount: 1,
  },
  {
    tierName: 'sovereign_annual',
    productName: 'HivePhoto Sovereign (Annual)',
    description: 'Sovereign annual — unlimited storage, priority AI, 2 months free',
    unitAmount: 11688,
    interval: 'year' as const,
    intervalCount: 1,
  },
]

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const results: { tierName: string; priceId: string; ok: boolean; error?: string }[] = []

  for (const p of PRODUCTS) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: p.productName,
        description: p.description,
      })

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.unitAmount,
        currency: 'usd',
        recurring: {
          interval: p.interval,
          interval_count: p.intervalCount,
        },
      })

      // Update pricing_tiers table
      await sql`
        UPDATE pricing_tiers
        SET stripe_price_id = ${price.id}
        WHERE name = ${p.tierName}
      `

      results.push({ tierName: p.tierName, priceId: price.id, ok: true })
    } catch (e) {
      results.push({ tierName: p.tierName, priceId: '', ok: false, error: (e as Error).message })
    }
  }

  const failed = results.filter(r => !r.ok)
  return NextResponse.json({
    ok: failed.length === 0,
    results,
    summary: `${results.filter(r => r.ok).length}/${results.length} products created`,
  })
}
