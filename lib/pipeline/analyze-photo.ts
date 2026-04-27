import { getObjectBuffer, getSignedGetUrl } from '@/lib/storage/r2'
import { analyzePhoto } from '@/lib/ai/analyze-photo'
import { analyzeDocument } from '@/lib/ai/analyze-document'
import { updatePhotoAiResults, markPhotoProcessingError, getPhotoById } from '@/lib/db/photos'
import { insertFaces } from '@/lib/db/faces'
import { isDocumentExt, isRawExt } from '@/lib/storage/keys'
import { env } from '@/lib/env'

export async function analyzePhotoById(photoId: string, userId: string): Promise<void> {
  const photo = await getPhotoById(photoId, userId)
  if (!photo?.originalKey) {
    throw new Error(`Photo ${photoId} has no storage key`)
  }

  const format = photo.originalKey.split('.').pop()?.toLowerCase() ?? ''
  const isDoc = isDocumentExt(format)
  const isRaw = isRawExt(format)

  try {
    const buffer = await getObjectBuffer(env.R2_BUCKET_ORIGINALS, photo.originalKey)
    const result = isDoc
      ? await analyzeDocument(buffer, format)
      : isRaw
        ? { title: `RAW Photo (${format.toUpperCase()})`, description: `A ${format.toUpperCase()} raw camera file. EXIF metadata extracted at upload.`, objects: ['RAW photo', format.toUpperCase()], scenes: ['photography'], emotions: [], actions: [], colors: ['#1a1a1a'], dominantColor: '#1a1a1a', locationName: null, faces: [] }
        : await analyzePhoto(buffer)

    await updatePhotoAiResults({
      id: photoId,
      title: result.title,
      description: result.description,
      objects: result.objects,
      scenes: result.scenes,
      emotions: result.emotions,
      actions: result.actions,
      colors: result.colors,
      dominantColor: result.dominantColor,
      locationName: result.locationName ?? null,
      faces: result.faces,
    })

    if (result.faces.length > 0) {
      await insertFaces(
        photoId,
        result.faces.map((f) => ({
          boundingBox: f.boundingBox,
          emotion: f.emotion,
          isLookingAtCamera: f.isLookingAtCamera,
          estimatedAgeGroup: f.estimatedAgeGroup,
        }))
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await markPhotoProcessingError(photoId, message)
    throw error
  }
}
