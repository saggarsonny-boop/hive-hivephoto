-- HivePhoto Database Schema
-- Run migrations in order: 001_init.sql, 002_faces.sql

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS photos (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 TEXT NOT NULL,
  storage_key             TEXT,
  thumb_key               TEXT,
  sha256                  TEXT,
  phash                   TEXT,
  filename                TEXT,
  mime_type               TEXT,
  file_size               BIGINT,
  width                   INT,
  height                  INT,
  taken_at                TIMESTAMPTZ NOT NULL,
  gps_lat                 DOUBLE PRECISION,
  gps_lon                 DOUBLE PRECISION,
  ai_description          TEXT,
  ai_tags                 TEXT[],
  ai_faces_raw            JSONB,
  ai_scene                TEXT,
  ai_location             TEXT,
  duplicate_review_status TEXT NOT NULL DEFAULT 'none',
  upload_status           TEXT NOT NULL DEFAULT 'awaiting_upload',
  processing_status       TEXT NOT NULL DEFAULT 'pending',
  processing_attempts     INT NOT NULL DEFAULT 0,
  processing_error        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_hash_per_user UNIQUE (user_id, sha256),
  CONSTRAINT finalized_photos_require_storage
    CHECK (upload_status != 'uploaded' OR (storage_key IS NOT NULL AND thumb_key IS NOT NULL)),
  CONSTRAINT gps_both_or_neither
    CHECK ((gps_lat IS NULL) = (gps_lon IS NULL)),
  CONSTRAINT processing_attempts_non_negative
    CHECK (processing_attempts >= 0)
);

CREATE INDEX IF NOT EXISTS idx_photos_user_taken_at ON photos (user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_user_sha256 ON photos (user_id, sha256);
CREATE INDEX IF NOT EXISTS idx_photos_processing_status
  ON photos (processing_status)
  WHERE processing_status IN ('pending', 'error');
CREATE INDEX IF NOT EXISTS idx_photos_ai_tags ON photos USING GIN (ai_tags);
CREATE INDEX IF NOT EXISTS idx_photos_ai_description_trgm
  ON photos USING GIN (ai_description gin_trgm_ops);

-- ============================================================
-- PEOPLE
-- ============================================================
CREATE TABLE IF NOT EXISTS people (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL,
  name              TEXT,
  avatar_thumb_key  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_people_user_id ON people (user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PHOTO FACES
-- ============================================================
CREATE TABLE IF NOT EXISTS photo_faces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id        UUID NOT NULL REFERENCES photos (id) ON DELETE CASCADE,
  person_id       UUID REFERENCES people (id) ON DELETE SET NULL,
  bbox            JSONB NOT NULL,
  confidence      FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  embedding_key   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photo_faces_photo_id ON photo_faces (photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_faces_person_id ON photo_faces (person_id);

-- ============================================================
-- ALBUMS
-- ============================================================
CREATE TABLE IF NOT EXISTS albums (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums (user_id);

CREATE OR REPLACE TRIGGER albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ALBUM PHOTOS (join table)
-- ============================================================
CREATE TABLE IF NOT EXISTS album_photos (
  album_id    UUID NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  photo_id    UUID NOT NULL REFERENCES photos (id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (album_id, photo_id)
);

CREATE INDEX IF NOT EXISTS idx_album_photos_album_id ON album_photos (album_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_photo_id ON album_photos (photo_id);
