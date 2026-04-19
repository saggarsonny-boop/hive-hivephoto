import { objectExists, getObjectBuffer, putObject } from "@/lib/storage/r2";
import { extractMetadata } from "@/lib/image/metadata";
import { pHash } from "@/lib/image/hash";
import { generateThumbnail } from "@/lib/image/thumbnail";
import {
  updatePhotoAfterUpload,
  findNearDuplicates,
  markDuplicateFlagged,
  getPhotoById,
} from "@/lib/db/photos";
import { thumbKey } from "@/lib/storage/keys";
import { env } from "@/lib/env";
import type { CompleteUploadResponse } from "@/lib/types/pipeline";

export async function finalizeUpload(
  userId: string,
  photoId: string,
  storageKey: string
): Promise<CompleteUploadResponse> {
  // Verify object is in R2
  const exists = await objectExists(env.R2_BUCKET_ORIGINALS, storageKey);
  if (!exists) {
    throw new Error(`Object not found in R2: ${storageKey}`);
  }

  // Fetch the original
  const buffer = await getObjectBuffer(env.R2_BUCKET_ORIGINALS, storageKey);

  // Get photo record to retrieve filename
  const photoRecord = await getPhotoById(photoId, userId);
  const filename = photoRecord?.filename ?? undefined;

  // Extract metadata
  const metadata = await extractMetadata(buffer, filename);

  // Compute pHash
  const hash = await pHash(buffer);

  // Generate and upload thumbnail
  const thumb = await generateThumbnail(buffer);
  const tKey = thumbKey(userId, photoId);
  await putObject(env.R2_BUCKET_THUMBS, tKey, thumb, "image/webp");

  // Finalize photo row
  await updatePhotoAfterUpload({
    id: photoId,
    storageKey,
    thumbKey: tKey,
    width: metadata.width,
    height: metadata.height,
    takenAt: metadata.takenAt,
    gpsLat: metadata.gpsLat,
    gpsLon: metadata.gpsLon,
    phash: hash,
  });

  // Near-duplicate check
  const nearDupes = await findNearDuplicates(userId, hash);
  const dupes = nearDupes.filter((p) => p.id !== photoId);

  if (dupes.length > 0) {
    await markDuplicateFlagged(photoId);
    return {
      success: true,
      photoId,
      isDuplicateCandidate: true,
      duplicateOfId: dupes[0].id,
    };
  }

  return { success: true, photoId };
}
