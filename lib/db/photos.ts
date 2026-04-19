import { sql } from "./client";
import type { DbPhoto } from "@/lib/types/db";
import type { Photo } from "@/lib/types/photo";
import type { SearchFilters } from "@/lib/types/search";
import { mapPhoto } from "./mappers";

export async function createProvisionalPhoto(params: {
  userId: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  sha256: string;
  takenAt: Date;
}): Promise<string> {
  const rows = await sql`
    INSERT INTO photos (user_id, filename, mime_type, file_size, sha256, taken_at, upload_status, processing_status)
    VALUES (
      ${params.userId},
      ${params.filename},
      ${params.mimeType},
      ${params.fileSize},
      ${params.sha256},
      ${params.takenAt.toISOString()},
      'awaiting_upload',
      'pending'
    )
    RETURNING id
  `;
  return (rows[0] as { id: string }).id;
}

export async function findPhotoByHash(userId: string, sha256: string): Promise<Photo | null> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND sha256 = ${sha256}
      AND upload_status = 'uploaded'
    LIMIT 1
  `;
  if (!rows.length) return null;
  return mapPhoto(rows[0] as unknown as DbPhoto);
}

export async function getPhotoById(id: string, userId: string): Promise<Photo | null> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `;
  if (!rows.length) return null;
  return mapPhoto(rows[0] as unknown as DbPhoto);
}

export async function getPhotosByUser(userId: string, limit = 50, offset = 0): Promise<Photo[]> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND upload_status = 'uploaded'
    ORDER BY taken_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return (rows as unknown as DbPhoto[]).map(mapPhoto);
}

export async function updatePhotoAfterUpload(params: {
  id: string;
  storageKey: string;
  thumbKey: string;
  width: number | null;
  height: number | null;
  takenAt: Date;
  gpsLat: number | null;
  gpsLon: number | null;
  phash: string | null;
}): Promise<void> {
  await sql`
    UPDATE photos SET
      storage_key = ${params.storageKey},
      thumb_key = ${params.thumbKey},
      width = ${params.width},
      height = ${params.height},
      taken_at = ${params.takenAt.toISOString()},
      gps_lat = ${params.gpsLat},
      gps_lon = ${params.gpsLon},
      phash = ${params.phash},
      upload_status = 'uploaded',
      processing_status = 'pending',
      updated_at = now()
    WHERE id = ${params.id}
  `;
}

export async function updatePhotoAiResults(params: {
  id: string;
  description: string;
  tags: string[];
  scene: string;
  location: string | null;
  facesRaw: unknown;
}): Promise<void> {
  await sql`
    UPDATE photos SET
      ai_description = ${params.description},
      ai_tags = ${params.tags},
      ai_scene = ${params.scene},
      ai_location = ${params.location},
      ai_faces_raw = ${JSON.stringify(params.facesRaw)},
      processing_status = 'done',
      updated_at = now()
    WHERE id = ${params.id}
  `;
}

export async function markPhotoProcessingError(id: string, error: string): Promise<void> {
  await sql`
    UPDATE photos SET
      processing_status = CASE WHEN processing_attempts >= 2 THEN 'error' ELSE 'pending' END,
      processing_attempts = processing_attempts + 1,
      processing_error = ${error},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function claimPhotosForProcessing(limit: number): Promise<Photo[]> {
  const rows = await sql`
    UPDATE photos SET
      processing_status = 'processing',
      updated_at = now()
    WHERE id IN (
      SELECT id FROM photos
      WHERE processing_status = 'pending'
        AND upload_status = 'uploaded'
        AND processing_attempts < 3
      ORDER BY created_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    )
    RETURNING *
  `;
  return (rows as unknown as DbPhoto[]).map(mapPhoto);
}

export async function findNearDuplicates(userId: string, phash: string): Promise<Photo[]> {
  // Fetch all uploaded photos with phash for this user, compute hamming distance in JS
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND phash IS NOT NULL
      AND upload_status = 'uploaded'
  `;
  return (rows as unknown as DbPhoto[])
    .map(mapPhoto)
    .filter((p) => p.phash && hammingDistance(phash, p.phash) <= 3);
}

function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return Infinity;
  let dist = 0;
  for (let i = 0; i < a.length; i += 2) {
    const byteA = parseInt(a.slice(i, i + 2), 16);
    const byteB = parseInt(b.slice(i, i + 2), 16);
    let xor = byteA ^ byteB;
    while (xor) {
      dist += xor & 1;
      xor >>= 1;
    }
  }
  return dist;
}

export async function markDuplicateFlagged(id: string): Promise<void> {
  await sql`
    UPDATE photos SET duplicate_review_status = 'flagged', updated_at = now()
    WHERE id = ${id}
  `;
}

export async function updateDuplicateStatus(id: string, status: string): Promise<void> {
  await sql`
    UPDATE photos SET duplicate_review_status = ${status}, updated_at = now()
    WHERE id = ${id}
  `;
}

export async function getDuplicateFlagged(userId: string): Promise<Photo[]> {
  const rows = await sql`
    SELECT * FROM photos
    WHERE user_id = ${userId}
      AND duplicate_review_status = 'flagged'
    ORDER BY created_at DESC
  `;
  return (rows as unknown as DbPhoto[]).map(mapPhoto);
}

export async function deletePhoto(id: string, userId: string): Promise<void> {
  await sql`DELETE FROM photos WHERE id = ${id} AND user_id = ${userId}`;
}

export async function searchPhotos(userId: string, filters: SearchFilters, limit = 50, offset = 0): Promise<Photo[]> {
  const rows = await sql`
    SELECT DISTINCT p.* FROM photos p
    LEFT JOIN photo_faces pf ON pf.photo_id = p.id
    LEFT JOIN people pe ON pe.id = pf.person_id
    WHERE p.user_id = ${userId}
      AND p.upload_status = 'uploaded'
      AND (${filters.dateFrom ?? null}::timestamptz IS NULL OR p.taken_at >= ${filters.dateFrom ?? null}::timestamptz)
      AND (${filters.dateTo ?? null}::timestamptz IS NULL OR p.taken_at <= ${filters.dateTo ?? null}::timestamptz)
      AND (${filters.scene ?? null} IS NULL OR p.ai_scene ILIKE ${'%' + (filters.scene ?? '') + '%'})
      AND (${filters.location ?? null} IS NULL OR p.ai_location ILIKE ${'%' + (filters.location ?? '') + '%'})
      AND (${filters.freeText ?? null} IS NULL OR p.ai_description ILIKE ${'%' + (filters.freeText ?? '') + '%'})
      AND (${filters.personName ?? null} IS NULL OR pe.name ILIKE ${'%' + (filters.personName ?? '') + '%'})
      AND (${filters.tags == null ? null : filters.tags.join(',')} IS NULL
           OR p.ai_tags && ${filters.tags ?? []}::text[])
    ORDER BY p.taken_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return (rows as unknown as DbPhoto[]).map(mapPhoto);
}

export async function deleteProvisionalPhotos(olderThanMinutes: number): Promise<number> {
  const rows = await sql`
    DELETE FROM photos
    WHERE upload_status = 'awaiting_upload'
      AND created_at < now() - (${olderThanMinutes} || ' minutes')::interval
    RETURNING id
  `;
  return rows.length;
}
