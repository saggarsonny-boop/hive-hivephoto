'use client'
import { useRef, useState } from 'react'
import { UpgradePrompt } from '@/components/shared/UpgradePrompt'
import type { PresignResponse, CompleteUploadResponse } from '@/lib/types/pipeline'

const EXT_MIME_MAP: Record<string, string> = {
  nef: 'image/x-nikon-nef', nrw: 'image/x-nikon-nrw', arw: 'image/x-sony-arw',
  srf: 'image/x-sony-srf', sr2: 'image/x-sony-sr2', cr2: 'image/x-canon-cr2',
  cr3: 'image/x-canon-cr3', crw: 'image/x-canon-crw', raf: 'image/x-fujifilm-raf',
  rw2: 'image/x-panasonic-rw2', orf: 'image/x-olympus-orf', pef: 'image/x-pentax-pef',
  ptx: 'image/x-pentax-ptx', dng: 'image/x-adobe-dng', raw: 'image/x-raw',
  rwl: 'image/x-leica-rwl', '3fr': 'image/x-hasselblad-3fr', fff: 'image/x-hasselblad-fff',
  iiq: 'image/x-phase-one-iiq', cap: 'image/x-phase-one-cap', erf: 'image/x-epson-erf',
  mef: 'image/x-mamiya-mef', mos: 'image/x-leaf-mos', mrw: 'image/x-minolta-mrw',
  x3f: 'image/x-sigma-x3f', heic: 'image/heic', heif: 'image/heif',
  uds: 'application/x-universal-document-sealed',
  udr: 'application/x-universal-document-revisable',
  udz: 'application/x-universal-document-bundle',
}

const ACCEPTED_EXTS = new Set(Object.keys(EXT_MIME_MAP))

function resolveFileMime(file: File): string {
  if (file.type && file.type !== 'application/octet-stream') return file.type
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return EXT_MIME_MAP[ext] ?? file.type ?? 'application/octet-stream'
}

function isAcceptedFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return ACCEPTED_EXTS.has(ext)
}

interface QueueItem {
  id: string
  filename: string
  status: 'pending' | 'uploading' | 'done' | 'error' | 'duplicate'
  progress: number
  error?: string
  photoId?: string
  isNearDuplicate?: boolean
}

interface Props {
  queue: QueueItem[]
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>
}

async function sha256Hex(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-256', arrayBuffer)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function UploadZone({ queue, setQueue }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [storageLimitHit, setStorageLimitHit] = useState(false)

  function updateItem(id: string, update: Partial<QueueItem>) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...update } : item)))
  }

  async function processFile(file: File) {
    const queueId = `${Date.now()}-${file.name}`
    const newItem: QueueItem = {
      id: queueId,
      filename: file.name,
      status: 'pending',
      progress: 0,
    }
    setQueue((prev) => [...prev, newItem])

    try {
      updateItem(queueId, { status: 'uploading', progress: 10 })

      // Compute SHA-256
      const sha256Hash = await sha256Hex(file)
      updateItem(queueId, { progress: 20 })

      // Presign
      const presignRes = await fetch('/api/ingest/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: resolveFileMime(file),
          fileSize: file.size,
          sha256Hash,
        }),
      })

      if (presignRes.status === 402) {
        setStorageLimitHit(true)
        updateItem(queueId, { status: 'error', error: 'Storage limit reached' })
        return
      }

      if (presignRes.status === 503) {
        updateItem(queueId, { status: 'error', error: 'Upload unavailable — R2 storage not configured. Check Vercel env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_ORIGINALS.' })
        return
      }

      const presign = (await presignRes.json()) as PresignResponse

      if (presign.isDuplicate) {
        updateItem(queueId, { status: 'duplicate', progress: 100, photoId: presign.existingId })
        return
      }

      if (!presign.uploadUrl || !presign.photoId || !presign.storageKey) {
        throw new Error('Invalid presign response')
      }

      updateItem(queueId, { progress: 30 })

      // PUT to R2
      const putRes = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': resolveFileMime(file) },
        body: file,
      })

      if (!putRes.ok) throw new Error(`R2 upload failed: ${putRes.status}`)
      updateItem(queueId, { progress: 70 })

      // Complete
      const completeRes = await fetch('/api/ingest/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: presign.photoId, storageKey: presign.storageKey }),
      })
      const complete = (await completeRes.json()) as CompleteUploadResponse

      updateItem(queueId, {
        status: 'done',
        progress: 100,
        photoId: complete.photoId,
        isNearDuplicate: complete.isNearDuplicate,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      updateItem(queueId, { status: 'error', error: msg })
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const accepted = Array.from(files).filter(isAcceptedFile)
    for (const file of accepted) {
      await processFile(file)
    }
  }

  return (
    <>
      {storageLimitHit && (
        <UpgradePrompt
          message="You've reached your storage limit."
          onDismiss={() => setStorageLimitHit(false)}
        />
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-amber-400 bg-amber-400/5'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
        }`}
      >
        <div className="text-4xl mb-3">📷</div>
        <p className="text-white font-semibold mb-1">Drop photos here</p>
        <p className="text-zinc-400 text-sm">or click to select files</p>
        <p className="text-zinc-600 text-xs mt-2">Photos (JPEG, PNG, HEIC, WebP, RAW), Universal Documents (.uds, .udr, .udz)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.nef,.nrw,.arw,.srf,.sr2,.cr2,.cr3,.crw,.raf,.rw2,.orf,.pef,.ptx,.dng,.raw,.rwl,.3fr,.fff,.iiq,.cap,.erf,.mef,.mos,.mrw,.x3f,.uds,.udr,.udz"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </>
  )
}
