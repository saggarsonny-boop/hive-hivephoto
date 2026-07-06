'use client'
import { useState } from 'react'
import type { Person } from '@/lib/types/photo'

interface Props {
  faceId: string
  people: Person[]
  onLabel: (personId: string | null) => void
  onClose: () => void
}

export function FaceLabelModal({ faceId, people, onLabel, onClose }: Props) {
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  async function labelFace(personId: string | null) {
    setSaving(true)
    try {
      await fetch(`/api/faces/${faceId}/label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId }),
      })
      onLabel(personId)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function createAndLabel() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      const person = (await res.json()) as Person
      await labelFace(person.id)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-sm border border-zinc-700" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold mb-4">Who is this?</h3>
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {people.map((person) => (
            <button
              key={person.id}
              onClick={() => labelFace(person.id)}
              disabled={saving}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              {person.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New person name"
            className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            onKeyDown={(e) => e.key === 'Enter' && createAndLabel()}
          />
          <button
            onClick={createAndLabel}
            disabled={saving || !newName.trim()}
            className="bg-amber-400 text-zinc-950 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <button
          onClick={() => labelFace(null)}
          className="w-full mt-3 text-zinc-500 hover:text-zinc-300 text-xs"
        >
          Clear label
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
