import sharp from "sharp";

/**
 * Generate a thumbnail: max 800px on the longest side, WebP quality 80.
 */
export async function generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .rotate() // Auto-rotate based on EXIF orientation
    .resize(800, 800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();
}
