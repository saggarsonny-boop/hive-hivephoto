import sharp from "sharp";

/**
 * Compute a DCT-based perceptual hash (pHash) of an image.
 * Returns a 64-bit hex string (16 hex chars).
 */
export async function pHash(imageBuffer: Buffer): Promise<string> {
  // Resize to 32x32 grayscale
  const { data } = await sharp(imageBuffer)
    .resize(32, 32, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(data);
  const size = 32;

  // Compute DCT
  const dct: number[][] = [];
  for (let u = 0; u < size; u++) {
    dct[u] = [];
    for (let v = 0; v < size; v++) {
      let sum = 0;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          sum +=
            pixels[i * size + j] *
            Math.cos(((2 * i + 1) * u * Math.PI) / (2 * size)) *
            Math.cos(((2 * j + 1) * v * Math.PI) / (2 * size));
        }
      }
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      dct[u][v] = (2 / size) * cu * cv * sum;
    }
  }

  // Use top-left 8x8 DCT coefficients (skip DC at [0][0])
  const coeffs: number[] = [];
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      if (u === 0 && v === 0) continue;
      coeffs.push(dct[u][v]);
    }
  }

  const avg = coeffs.reduce((a, b) => a + b, 0) / coeffs.length;

  // Build 64-bit hash: 1 if coeff > avg, else 0
  // Include DC back to get 64 bits
  const allCoeffs: number[] = [];
  for (let u = 0; u < 8; u++) {
    for (let v = 0; v < 8; v++) {
      allCoeffs.push(dct[u][v]);
    }
  }
  const fullAvg = allCoeffs.reduce((a, b) => a + b, 0) / allCoeffs.length;

  let hashBits = "";
  for (const c of allCoeffs) {
    hashBits += c >= fullAvg ? "1" : "0";
  }

  // Convert bits to hex (64 bits = 16 hex chars)
  let hex = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    hex += parseInt(hashBits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/**
 * Compute the Hamming distance between two hex pHash strings.
 */
export function hammingDistance(a: string, b: string): number {
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
