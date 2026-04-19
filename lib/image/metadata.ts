import ExifReader from "exifreader";
import type { ExtractedMetadata } from "@/lib/types/pipeline";

/**
 * Extract image metadata from a buffer.
 * takenAt fallback chain: EXIF DateTimeOriginal -> filename date -> now()
 */
export async function extractMetadata(
  buffer: Buffer,
  filename?: string
): Promise<ExtractedMetadata> {
  let tags: ExifReader.Tags = {} as ExifReader.Tags;
  try {
    tags = ExifReader.load(buffer);
  } catch {
    // Non-fatal: proceed with defaults
  }

  // Dimensions
  const width = (tags["Image Width"]?.value as number) ?? (tags["PixelXDimension"]?.value as number) ?? null;
  const height = (tags["Image Height"]?.value as number) ?? (tags["PixelYDimension"]?.value as number) ?? null;

  // Timestamp
  let takenAt: Date | null = null;
  const exifDate = tags["DateTimeOriginal"]?.description as string | undefined;
  if (exifDate) {
    // EXIF format: "2023:06:15 14:30:00"
    const normalized = exifDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) takenAt = parsed;
  }

  if (!takenAt && filename) {
    // Try to extract date from filename like: IMG_20230615_143000.jpg, 2023-06-15 ...
    const match = filename.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
    if (match) {
      const parsed = new Date(`${match[1]}-${match[2]}-${match[3]}`);
      if (!isNaN(parsed.getTime())) takenAt = parsed;
    }
  }

  if (!takenAt) takenAt = new Date();

  // GPS
  let gpsLat: number | null = null;
  let gpsLon: number | null = null;

  const latTag = tags["GPSLatitude"];
  const lonTag = tags["GPSLongitude"];
  const latRef = tags["GPSLatitudeRef"]?.description as string | undefined;
  const lonRef = tags["GPSLongitudeRef"]?.description as string | undefined;

  if (latTag && lonTag) {
    try {
      gpsLat = parseGpsCoordinate(latTag.value as unknown as [number, number, number][], latRef);
      gpsLon = parseGpsCoordinate(lonTag.value as unknown as [number, number, number][], lonRef);
    } catch {
      gpsLat = null;
      gpsLon = null;
    }
  }

  return { width, height, takenAt, gpsLat, gpsLon };
}

function parseGpsCoordinate(
  value: [number, number, number][] | number,
  ref?: string
): number {
  let decimal: number;

  if (Array.isArray(value)) {
    // value is array of [numerator, denominator] pairs
    const deg = Array.isArray(value[0]) ? value[0][0] / value[0][1] : (value[0] as unknown as number);
    const min = Array.isArray(value[1]) ? value[1][0] / value[1][1] : (value[1] as unknown as number);
    const sec = Array.isArray(value[2]) ? value[2][0] / value[2][1] : (value[2] as unknown as number);
    decimal = deg + min / 60 + sec / 3600;
  } else {
    decimal = value as unknown as number;
  }

  if (ref === "S" || ref === "W") decimal = -decimal;
  return decimal;
}
