import type { DbPhoto, DbPerson, DbPhotoFace } from "@/lib/types/db";
import type { Photo, Person, PhotoFace } from "@/lib/types/photo";
import { env } from "@/lib/env";

export function mapPhoto(row: DbPhoto): Photo {
  return {
    id: row.id,
    userId: row.user_id,
    storageKey: row.storage_key,
    thumbKey: row.thumb_key,
    sha256: row.sha256,
    phash: row.phash,
    filename: row.filename,
    mimeType: row.mime_type,
    fileSize: row.file_size ? Number(row.file_size) : null,
    width: row.width,
    height: row.height,
    takenAt: row.taken_at.toISOString(),
    gpsLat: row.gps_lat,
    gpsLon: row.gps_lon,
    aiDescription: row.ai_description,
    aiTags: row.ai_tags,
    aiScene: row.ai_scene,
    aiLocation: row.ai_location,
    duplicateReviewStatus: row.duplicate_review_status,
    uploadStatus: row.upload_status,
    processingStatus: row.processing_status,
    processingError: row.processing_error,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    thumbUrl: row.thumb_key
      ? `${env.R2_PUBLIC_THUMB_URL}/${row.thumb_key}`
      : undefined,
  };
}

export function mapPerson(row: DbPerson & { face_count?: string }): Person {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatarThumbKey: row.avatar_thumb_key,
    avatarThumbUrl: row.avatar_thumb_key
      ? `${env.R2_PUBLIC_THUMB_URL}/${row.avatar_thumb_key}`
      : undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    faceCount: row.face_count ? parseInt(row.face_count, 10) : undefined,
  };
}

export function mapFace(row: DbPhotoFace): PhotoFace {
  return {
    id: row.id,
    photoId: row.photo_id,
    personId: row.person_id,
    bbox: row.bbox as { x: number; y: number; w: number; h: number },
    confidence: row.confidence,
    embeddingKey: row.embedding_key,
    createdAt: row.created_at.toISOString(),
  };
}
