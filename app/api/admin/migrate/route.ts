import { NextRequest, NextResponse } from 'next/server'
import { Pool, neonConfig } from '@neondatabase/serverless'

// One-shot migration endpoint. Protected by CRON_SECRET.
// Hit POST /api/admin/migrate once after first Vercel deployment.
// Safe to re-run — all DDL uses IF NOT EXISTS.

// Use native WebSocket (Node 18+ on Vercel)
if (typeof WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require('ws')
}

const STEPS: { name: string; sql: string }[] = [
  {
    name: 'extensions',
    sql: `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `,
  },
  {
    name: 'photos_table',
    sql: `
      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        original_key TEXT,
        thumb_key TEXT,
        thumb_url TEXT,
        format TEXT,
        file_size_bytes BIGINT,
        width INTEGER,
        height INTEGER,
        is_provisional BOOLEAN NOT NULL DEFAULT TRUE,
        upload_status TEXT NOT NULL DEFAULT 'awaiting_upload'
          CHECK (upload_status IN ('awaiting_upload','uploaded','abandoned')),
        taken_at TIMESTAMPTZ NOT NULL,
        taken_at_confidence TEXT NOT NULL DEFAULT 'upload'
          CHECK (taken_at_confidence IN ('exif','filename','upload')),
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        gps_lat DOUBLE PRECISION,
        gps_lng DOUBLE PRECISION,
        location_name TEXT,
        camera_make TEXT,
        camera_model TEXT,
        ai_title TEXT,
        user_title TEXT,
        ai_description TEXT,
        objects TEXT[] NOT NULL DEFAULT '{}',
        scenes TEXT[] NOT NULL DEFAULT '{}',
        emotions TEXT[] NOT NULL DEFAULT '{}',
        actions TEXT[] NOT NULL DEFAULT '{}',
        colors TEXT[] NOT NULL DEFAULT '{}',
        dominant_color TEXT,
        sha256_hash TEXT NOT NULL,
        p_hash TEXT,
        is_near_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
        near_duplicate_of UUID REFERENCES photos(id) ON DELETE SET NULL,
        duplicate_review_status TEXT NOT NULL DEFAULT 'pending'
          CHECK (duplicate_review_status IN ('pending','kept_new','kept_original','kept_both')),
        processing_status TEXT NOT NULL DEFAULT 'pending'
          CHECK (processing_status IN ('pending','processing','done','error')),
        processing_error TEXT,
        processing_attempts INTEGER NOT NULL DEFAULT 0 CHECK (processing_attempts >= 0),
        processing_last_attempted_at TIMESTAMPTZ,
        deleted_at TIMESTAMPTZ,
        CONSTRAINT unique_hash_per_user UNIQUE (user_id, sha256_hash),
        CONSTRAINT finalized_photos_require_storage CHECK (
          is_provisional = TRUE OR (
            original_key IS NOT NULL AND thumb_key IS NOT NULL AND thumb_url IS NOT NULL
            AND format IS NOT NULL AND file_size_bytes IS NOT NULL
            AND width IS NOT NULL AND height IS NOT NULL
          )
        ),
        CONSTRAINT gps_both_or_neither CHECK ((gps_lat IS NULL) = (gps_lng IS NULL))
      );
    `,
  },
  {
    name: 'people_table',
    sql: `
      CREATE TABLE IF NOT EXISTS people (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        cover_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
        photo_count INTEGER NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_person_name_per_user UNIQUE (user_id, name)
      );
    `,
  },
  {
    name: 'albums_table',
    sql: `
      CREATE TABLE IF NOT EXISTS albums (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        cover_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
        is_smart BOOLEAN NOT NULL DEFAULT FALSE,
        smart_query TEXT,
        photo_count INTEGER NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: 'album_photos_table',
    sql: `
      CREATE TABLE IF NOT EXISTS album_photos (
        album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
        position INTEGER,
        added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (album_id, photo_id)
      );
    `,
  },
  {
    name: 'photos_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_photos_gallery ON photos(user_id, taken_at DESC)
        WHERE deleted_at IS NULL AND is_provisional = FALSE AND is_near_duplicate = FALSE;
      CREATE INDEX IF NOT EXISTS idx_photos_analysis_queue ON photos(processing_attempts, processing_last_attempted_at, uploaded_at)
        WHERE upload_status = 'uploaded' AND processing_status IN ('pending','error') AND processing_attempts < 3 AND deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_photos_dupe_review ON photos(user_id, uploaded_at DESC)
        WHERE is_near_duplicate = TRUE AND duplicate_review_status = 'pending' AND deleted_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_photos_provisional_cleanup ON photos(upload_status, uploaded_at)
        WHERE is_provisional = TRUE AND upload_status = 'awaiting_upload';
      CREATE INDEX IF NOT EXISTS idx_photos_sha256 ON photos(user_id, sha256_hash);
      CREATE INDEX IF NOT EXISTS idx_photos_phash ON photos(p_hash) WHERE p_hash IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_photos_gps ON photos(gps_lat, gps_lng) WHERE gps_lat IS NOT NULL AND gps_lng IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_photos_objects ON photos USING GIN(objects);
      CREATE INDEX IF NOT EXISTS idx_photos_scenes ON photos USING GIN(scenes);
      CREATE INDEX IF NOT EXISTS idx_photos_emotions ON photos USING GIN(emotions);
      CREATE INDEX IF NOT EXISTS idx_photos_actions ON photos USING GIN(actions);
      CREATE INDEX IF NOT EXISTS idx_photos_description_trgm ON photos USING GIN(ai_description gin_trgm_ops)
        WHERE ai_description IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_people_user ON people(user_id);
    `,
  },
  {
    name: 'update_updated_at_fn',
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
    `,
  },
  {
    name: 'people_updated_at_trigger',
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'people_updated_at') THEN
          CREATE TRIGGER people_updated_at BEFORE UPDATE ON people
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        END IF;
      END $$;
    `,
  },
  {
    name: 'photo_faces_table',
    sql: `
      CREATE TABLE IF NOT EXISTS photo_faces (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
        person_id UUID REFERENCES people(id) ON DELETE SET NULL,
        bounding_box JSONB NOT NULL,
        emotion TEXT,
        is_looking_at_camera BOOLEAN,
        estimated_age_group TEXT CHECK (estimated_age_group IN ('child','teen','adult','elderly')),
        confidence DOUBLE PRECISION CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_faces_photo ON photo_faces(photo_id);
      CREATE INDEX IF NOT EXISTS idx_faces_person ON photo_faces(person_id) WHERE person_id IS NOT NULL;
    `,
  },
  {
    name: 'pricing_tiers_table',
    sql: `
      CREATE TABLE IF NOT EXISTS pricing_tiers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        price_cents INTEGER NOT NULL DEFAULT 0,
        price_interval TEXT CHECK (price_interval IN ('month','year')),
        storage_bytes BIGINT NOT NULL,
        is_founding BOOLEAN NOT NULL DEFAULT FALSE,
        founding_slots_total INTEGER,
        founding_slots_used INTEGER NOT NULL DEFAULT 0,
        founding_closes_at TIMESTAMPTZ,
        stripe_price_id TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: 'user_subscriptions_table',
    sql: `
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL UNIQUE,
        tier_id UUID NOT NULL REFERENCES pricing_tiers(id),
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_price_id TEXT,
        status TEXT NOT NULL DEFAULT 'active'
          CHECK (status IN ('active','past_due','canceled','trialing','incomplete')),
        current_period_start TIMESTAMPTZ,
        current_period_end TIMESTAMPTZ,
        cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: 'founding_members_table',
    sql: `
      CREATE TABLE IF NOT EXISTS founding_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        tier_id UUID NOT NULL REFERENCES pricing_tiers(id),
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, tier_id)
      );
    `,
  },
  {
    name: 'storage_events_table',
    sql: `
      CREATE TABLE IF NOT EXISTS storage_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
        event_type TEXT NOT NULL CHECK (event_type IN ('upload','delete','thumbnail')),
        bytes_delta BIGINT NOT NULL DEFAULT 0,
        storage_after BIGINT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `,
  },
  {
    name: 'pricing_history_table',
    sql: `
      CREATE TABLE IF NOT EXISTS pricing_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        from_tier_id UUID REFERENCES pricing_tiers(id),
        to_tier_id UUID REFERENCES pricing_tiers(id),
        changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reason TEXT
      );
    `,
  },
  {
    name: 'pricing_indexes_and_triggers',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_storage_events_user ON storage_events(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_founding_members_tier ON founding_members(tier_id);
    `,
  },
  {
    name: 'founding_slots_fn',
    sql: `
      CREATE OR REPLACE FUNCTION check_founding_slots()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.is_founding = TRUE AND NEW.founding_slots_total IS NOT NULL
           AND NEW.founding_slots_used >= NEW.founding_slots_total THEN
          NEW.founding_closes_at = NOW();
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `,
  },
  {
    name: 'pricing_triggers',
    sql: `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'founding_slots_check') THEN
          CREATE TRIGGER founding_slots_check
            BEFORE INSERT OR UPDATE ON pricing_tiers
            FOR EACH ROW EXECUTE FUNCTION check_founding_slots();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'pricing_tiers_updated_at') THEN
          CREATE TRIGGER pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_subscriptions_updated_at') THEN
          CREATE TRIGGER user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        END IF;
      END $$;
    `,
  },
  {
    name: 'seed_pricing_tiers',
    sql: `
      INSERT INTO pricing_tiers (name, display_name, price_cents, price_interval, storage_bytes, is_founding, founding_slots_total, sort_order) VALUES
        ('free',                      'Free',                    0,     NULL,    53687091200,   FALSE, NULL, 0),
        ('founding_patron_monthly',   'Founding Patron',         399,   'month', 2199023255552, TRUE,  1000, 1),
        ('patron_monthly',            'Patron',                  499,   'month', 2199023255552, FALSE, NULL, 2),
        ('patron_annual',             'Patron (Annual)',         4788,  'year',  2199023255552, FALSE, NULL, 3),
        ('founding_sovereign_monthly','Founding Sovereign',      999,   'month', -1,            TRUE,  500,  4),
        ('sovereign_monthly',         'Sovereign',               1299,  'month', -1,            FALSE, NULL, 5),
        ('sovereign_annual',          'Sovereign (Annual)',      11688, 'year',  -1,            FALSE, NULL, 6)
      ON CONFLICT (name) DO NOTHING;
    `,
  },
]

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  const results: { step: string; ok: boolean; error?: string }[] = []

  try {
    for (const step of STEPS) {
      try {
        await client.query(step.sql)
        results.push({ step: step.name, ok: true })
      } catch (e) {
        results.push({ step: step.name, ok: false, error: (e as Error).message })
      }
    }
  } finally {
    client.release()
    await pool.end()
  }

  const failed = results.filter(r => !r.ok)
  return NextResponse.json({
    ok: failed.length === 0,
    results,
    summary: `${results.filter(r => r.ok).length}/${results.length} steps succeeded`,
  })
}
