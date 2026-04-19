import { sql } from "@/lib/db/client";

export interface CleanupResult {
  deletedOrphanFaces: number;
  deletedErrorPhotos: number;
}

export async function runCleanup(): Promise<CleanupResult> {
  // Delete faces where the photo no longer exists (shouldn't happen with FK but safety net)
  const orphanResult = await sql`
    DELETE FROM photo_faces
    WHERE photo_id NOT IN (SELECT id FROM photos)
    RETURNING id
  `;

  // Delete photos stuck in error state for more than 7 days
  const errorResult = await sql`
    DELETE FROM photos
    WHERE processing_status = 'error'
      AND updated_at < now() - interval '7 days'
    RETURNING id
  `;

  return {
    deletedOrphanFaces: orphanResult.length,
    deletedErrorPhotos: errorResult.length,
  };
}
