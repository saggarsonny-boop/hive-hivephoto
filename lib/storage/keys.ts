export function origKey(userId: string, photoId: string, ext: string): string {
  const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext
  return `originals/${userId}/${photoId}.${cleanExt}`
}

export function thumbKey(userId: string, photoId: string): string {
  return `thumbs/${userId}/${photoId}.webp`
}

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/tiff': 'tiff',
  'image/avif': 'avif',
  // RAW formats
  'image/x-nikon-nef': 'nef',
  'image/x-nikon-nrw': 'nrw',
  'image/x-sony-arw': 'arw',
  'image/x-sony-srf': 'srf',
  'image/x-sony-sr2': 'sr2',
  'image/x-canon-cr2': 'cr2',
  'image/x-canon-cr3': 'cr3',
  'image/x-canon-crw': 'crw',
  'image/x-fujifilm-raf': 'raf',
  'image/x-panasonic-rw2': 'rw2',
  'image/x-olympus-orf': 'orf',
  'image/x-pentax-pef': 'pef',
  'image/x-pentax-ptx': 'ptx',
  'image/x-adobe-dng': 'dng',
  'image/x-raw': 'raw',
  'image/x-leica-rwl': 'rwl',
  'image/x-hasselblad-3fr': '3fr',
  'image/x-hasselblad-fff': 'fff',
  'image/x-phase-one-iiq': 'iiq',
  'image/x-phase-one-cap': 'cap',
  'image/x-epson-erf': 'erf',
  'image/x-mamiya-mef': 'mef',
  'image/x-leaf-mos': 'mos',
  'image/x-minolta-mrw': 'mrw',
  'image/x-sigma-x3f': 'x3f',
}

const RAW_EXTENSIONS = new Set([
  'nef','nrw','arw','srf','sr2','cr2','cr3','crw','raf','rw2','orf',
  'pef','ptx','dng','raw','rwl','3fr','fff','iiq','cap','erf','mef','mos','mrw','x3f',
])

export function extFromMime(mimeType: string): string {
  return MIME_TO_EXT[mimeType] ?? 'bin'
}

export function isRawExt(ext: string): boolean {
  return RAW_EXTENSIONS.has(ext.toLowerCase().replace(/^\./, ''))
}

export function isRawMime(mimeType: string): boolean {
  const ext = MIME_TO_EXT[mimeType]
  return ext ? RAW_EXTENSIONS.has(ext) : false
}

const DOCUMENT_EXTENSIONS = new Set(['uds', 'udr', 'udz'])

export function isDocumentExt(ext: string): boolean {
  return DOCUMENT_EXTENSIONS.has(ext.toLowerCase().replace(/^\./, ''))
}
