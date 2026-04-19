export interface DbPhoto {
  id: string;
  user_id: string;
  storage_key: string | null;
  thumb_key: string | null;
  sha256: string | null;
  phash: string | null;
  filename: string | null;
  mime_type: string | null;
  file_size: bigint | null;
  width: number | null;
  height: number | null;
  taken_at: Date;
  gps_lat: number | null;
  gps_lon: number | null;
  ai_description: string | null;
  ai_tags: string[] | null;
  ai_faces_raw: unknown | null;
  ai_scene: string | null;
  ai_location: string | null;
  duplicate_review_status: string;
  upload_status: string;
  processing_status: string;
  processing_attempts: number;
  processing_error: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbPerson {
  id: string;
  user_id: string;
  name: string | null;
  avatar_thumb_key: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbPhotoFace {
  id: string;
  photo_id: string;
  person_id: string | null;
  bbox: { x: number; y: number; w: number; h: number };
  confidence: number | null;
  embedding_key: string | null;
  created_at: Date;
}

export interface DbAlbum {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface DbAlbumPhoto {
  album_id: string;
  photo_id: string;
  added_at: Date;
}
