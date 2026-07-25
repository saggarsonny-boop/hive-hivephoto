'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { Photo } from '@/lib/types/photo'

interface Props {
  photo: Photo
}

const DOC_EXTS = new Set(['uds', 'udr', 'udz'])
const RAW_COMMON = new Set(['nef', 'arw', 'cr2', 'cr3', 'dng', 'raf', 'rw2', 'orf', 'raw'])

function FileIcon({ format }: { format: string | null }) {
  const ext = (format ?? '').toLowerCase()
  if (DOC_EXTS.has(ext)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-1">
        <div className="text-2xl">📄</div>
        <div className="text-xs font-mono text-amber-400 uppercase">.{ext}</div>
      </div>
    )
  }
  if (RAW_COMMON.has(ext)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-1">
        <div className="text-2xl">📷</div>
        <div className="text-xs font-mono text-zinc-400 uppercase">{ext}</div>
      </div>
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-700 rounded-full" />
    </div>
  )
}

export function PhotoCard({ photo }: Props) {
  const title = photo.userTitle ?? photo.aiTitle ?? 'Photo'
  const src = photo.thumbUrl

  return (
    <Link href={`/photo/${photo.id}`} className="group block relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
      ) : (
        <FileIcon format={photo.format} />
      )}
      {photo.processingStatus === 'pending' && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      )}
    </Link>
  )
}
