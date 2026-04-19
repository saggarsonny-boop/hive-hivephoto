export interface Photo {
  id: string;
  userId: string;
  storageKey: string | null;
  thumbKey: string | null;
  sha256: string | null;
  phash: string | null;
  filename: string | null;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  takenAt: string; // ISO string
  gpsLat: number | null;
  gpsLon: number | null;
  aiDescription: string | null;
  aiTags: string[] | null;
  aiScene: string | null;
  aiLocation: string | null;
  duplicateReviewStatus: string;
  uploadStatus: string;
  processingStatus: string;
  processingError: string | null;
  createdAt: string;
  updatedAt: string;
  thumbUrl?: string; // computed at read time
}

export interface PhotoFace {
  id: string;
  photoId: string;
  personId: string | null;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number | null;
  embeddingKey: string | null;
  createdAt: string;
}

export interface Person {
  id: string;
  userId: string;
  name: string | null;
  avatarThumbKey: string | null;
  avatarThumbUrl?: string;
  createdAt: string;
  updatedAt: string;
  faceCount?: number;
}

export type UploadStatus = "awaiting_upload" | "uploaded" | "failed";
export type ProcessingStatus = "pending" | "processing" | "done" | "error";
export type DuplicateReviewStatus = "none" | "flagged" | "kept_new" | "kept_original" | "kept_both";
