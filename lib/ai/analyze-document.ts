import type { PhotoAnalysis } from './analyze-photo'

interface UdsJson {
  title?: string
  name?: string
  documentTitle?: string
  subject?: string
  content?: string | { text?: string; blocks?: Array<{ text?: string; content?: string }> }
  body?: string
  text?: string
  blocks?: Array<{ text?: string; content?: string; type?: string }>
  metadata?: { title?: string; description?: string; subject?: string }
}

function extractTitle(obj: UdsJson): string {
  return (
    obj.title ??
    obj.name ??
    obj.documentTitle ??
    obj.subject ??
    obj.metadata?.title ??
    obj.metadata?.subject ??
    'Universal Document'
  )
}

function extractDescription(obj: UdsJson): string {
  const meta = obj.metadata?.description
  if (meta) return meta

  // Try top-level text/body
  if (typeof obj.body === 'string' && obj.body.trim()) return obj.body.trim().slice(0, 300)
  if (typeof obj.text === 'string' && obj.text.trim()) return obj.text.trim().slice(0, 300)

  // Try content field
  if (typeof obj.content === 'string' && obj.content.trim()) return obj.content.trim().slice(0, 300)

  // Try blocks array
  const blocks = obj.blocks ?? (typeof obj.content === 'object' && obj.content?.blocks) ?? []
  for (const block of blocks) {
    const t = block.text ?? block.content
    if (typeof t === 'string' && t.trim()) return t.trim().slice(0, 300)
  }

  return 'Universal Document Sealed file'
}

export async function analyzeDocument(buffer: Buffer, format: string): Promise<PhotoAnalysis> {
  let title = 'Universal Document'
  let description = `A .${format} Universal Document file`

  try {
    const text = buffer.toString('utf-8')
    const obj = JSON.parse(text) as UdsJson
    title = extractTitle(obj)
    description = extractDescription(obj)
  } catch {
    // Not JSON or unreadable — use defaults
  }

  return {
    title,
    description,
    objects: ['Universal Document', `.${format}`, 'document'],
    scenes: ['document'],
    emotions: [],
    actions: [],
    colors: ['#0f172a'],
    dominantColor: '#0f172a',
    locationName: null,
    faces: [],
  }
}
