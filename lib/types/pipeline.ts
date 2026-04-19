export interface PresignRequest {
  filename: string;
  mimeType: string;
  fileSize: number;
  sha256: string;
}

export interface PresignResponse {
  isDuplicate: boolean;
  existingId?: string;
  photoId?: string;
  uploadUrl?: string;
  storageKey?: string;
}

export interface CompleteUploadRequest {
  photoId: string;
  storageKey: string;
}

export interface CompleteUploadResponse {
  success: boolean;
  photoId: string;
  isDuplicateCandidate?: boolean;
  duplicateOfId?: string;
}

export interface ExtractedMetadata {
  width: number | null;
  height: number | null;
  takenAt: Date;
  gpsLat: number | null;
  gpsLon: number | null;
}

export interface AiFaceDetection {
  bbox: { x: number; y: number; w: number; h: number };
  estimated_age?: number;
  gender_hint?: string;
}

export interface AiAnalysisResult {
  description: string;
  tags: string[];
  scene: string;
  location: string | null;
  faces: AiFaceDetection[];
}
