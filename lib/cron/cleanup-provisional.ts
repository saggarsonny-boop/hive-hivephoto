import { deleteProvisionalPhotos } from "@/lib/db/photos";

const STALE_MINUTES = 60;

export interface CleanupProvisionalResult {
  deleted: number;
}

export async function runCleanupProvisional(): Promise<CleanupProvisionalResult> {
  const deleted = await deleteProvisionalPhotos(STALE_MINUTES);
  return { deleted };
}
