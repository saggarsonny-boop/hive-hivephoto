-- Migration 002: Face detection table
-- Depends on: 001_init.sql (photos, people tables)

CREATE TABLE photo_faces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id        UUID NOT NULL REFERENCES photos (id) ON DELETE CASCADE,
  person_id       UUID REFERENCES people (id) ON DELETE SET NULL,
  bbox            JSONB NOT NULL,
  confidence      FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  embedding_key   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photo_faces_photo_id ON photo_faces (photo_id);
CREATE INDEX idx_photo_faces_person_id ON photo_faces (person_id);
