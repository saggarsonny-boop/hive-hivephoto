'use client'
import { useState } from 'react'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photo: Photo
  onUpdate: (photo: Photo) => void
}

export function AITitleEditor({ photo, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(photo.userTitle ?? photo.aiTitle ?? '')
  const [saving, setSaving] = useState(false)

  const displayTitle = photo.userTitle ?? photo.aiTitle ?? 'Untitled'

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: value }),
      })
      const updated = (await res.json()) as Photo
      onUpdate(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') setEditing(false)
          }}
          autoFocus
        />
        <button
          onClick={save}
          disabled={saving}
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {saving ? '...' : 'Save'}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-zinc-400 hover:text-white px-2"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <h1 className="text-xl font-bold flex-1">{displayTitle}</h1>
      {!photo.userTitle && photo.aiTitle && (
        <span className="text-xs text-zinc-500 mt-1">AI</span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="text-zinc-500 hover:text-zinc-300 text-xs mt-1"
      >
        Edit
      </button>
    </div>
  )
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
