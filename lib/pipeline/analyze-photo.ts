import { getObjectBuffer } from "@/lib/storage/r2";
import { analyzePhoto } from "@/lib/ai/analyze-photo";
import { updatePhotoAiResults, markPhotoProcessingError, getPhotoById } from "@/lib/db/photos";
import { insertFaces } from "@/lib/db/faces";
import { env } from "@/lib/env";
import type { Photo } from "@/lib/types/photo";

export async function analyzePhotoById(photoId: string, userId: string): Promise<void> {
  const photo = await getPhotoById(photoId, userId);
  if (!photo?.storageKey) {
    throw new Error(`Photo ${photoId} has no storage key`);
  }

  try {
    // Fetch original from R2
    const buffer = await getObjectBuffer(env.R2_BUCKET_ORIGINALS, photo.storageKey);

    // Run AI analysis
    const result = await analyzePhoto(buffer);

    // Update photo row
    await updatePhotoAiResults({
      id: photoId,
      description: result.description,
      tags: result.tags,
      scene: result.scene,
      location: result.location,
      facesRaw: result.faces,
    });

    // Insert face detections
    if (result.faces.length > 0) {
      await insertFaces(photoId, result.faces);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await markPhotoProcessingError(photoId, message);
    throw error;
  }
}

export { analyzePhotoById as runAnalysisPipeline };
