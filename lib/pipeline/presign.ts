import { findPhotoByHash, createProvisionalPhoto } from "@/lib/db/photos";
import { getPresignedPutUrl } from "@/lib/storage/r2";
import { origKey, extFromMime } from "@/lib/storage/keys";
import { env } from "@/lib/env";
import type { PresignRequest, PresignResponse } from "@/lib/types/pipeline";

export async function presignUpload(
  userId: string,
  request: PresignRequest
): Promise<PresignResponse> {
  // Exact duplicate check
  const existing = await findPhotoByHash(userId, request.sha256);
  if (existing) {
    return { isDuplicate: true, existingId: existing.id };
  }

  // Create provisional photo row
  const photoId = await createProvisionalPhoto({
    userId,
    filename: request.filename,
    mimeType: request.mimeType,
    fileSize: request.fileSize,
    sha256: request.sha256,
    takenAt: new Date(),
  });

  const ext = extFromMime(request.mimeType);
  const key = origKey(userId, photoId, ext);

  const uploadUrl = await getPresignedPutUrl(
    env.R2_BUCKET_ORIGINALS,
    key,
    request.mimeType,
    3600
  );

  return {
    isDuplicate: false,
    photoId,
    uploadUrl,
    storageKey: key,
  };
}
