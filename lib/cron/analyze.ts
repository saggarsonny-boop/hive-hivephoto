import { claimPhotosForProcessing, markPhotoProcessingError } from "@/lib/db/photos";
import { runAnalysisPipeline } from "@/lib/pipeline/analyze-photo";

const BATCH_SIZE = 5;

export interface CronAnalyzeResult {
  processed: number;
  errors: number;
  photoIds: string[];
}

export async function runAnalyzeCron(): Promise<CronAnalyzeResult> {
  const photos = await claimPhotosForProcessing(BATCH_SIZE);

  if (!photos.length) {
    return { processed: 0, errors: 0, photoIds: [] };
  }

  let processed = 0;
  let errors = 0;
  const photoIds: string[] = [];

  for (const photo of photos) {
    try {
      await runAnalysisPipeline(photo.id, photo.userId);
      processed++;
      photoIds.push(photo.id);
    } catch (error) {
      errors++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[cron/analyze] Failed to analyze photo ${photo.id}: ${message}`);
      // markPhotoProcessingError already called inside runAnalysisPipeline on failure
    }
  }

  return { processed, errors, photoIds };
}
