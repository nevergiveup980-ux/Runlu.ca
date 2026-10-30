-- RUNLU MUSIC STUDIO — proposed Cloudflare D1 schema v0.1
-- Development only. NOT applied to a production database.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS music_jobs (
 id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT NOT NULL,
 idempotency_key TEXT NOT NULL,
 prompt TEXT NOT NULL CHECK(length(prompt) BETWEEN 1 AND 1000),
 language TEXT NOT NULL CHECK(language IN ('zh','en','fr','es')),
 duration_seconds INTEGER NOT NULL CHECK(duration_seconds IN (30,60)),
 instrumental INTEGER NOT NULL CHECK(instrumental IN (0,1)),
 status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','succeeded','failed')),
 provider TEXT,
 provider_job_id TEXT,
 track_id TEXT,
 error_code TEXT,
 error_message TEXT,
 estimated_cost_usd_micros INTEGER CHECK(estimated_cost_usd_micros IS NULL OR estimated_cost_usd_micros >= 0),
 actual_cost_usd_micros INTEGER CHECK(actual_cost_usd_micros IS NULL OR actual_cost_usd_micros >= 0),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 UNIQUE(owner_id,idempotency_key),
 CHECK(updated_at >= created_at),
 CHECK(status != 'succeeded' OR track_id IS NOT NULL),
 CHECK(status != 'failed' OR error_code IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_music_jobs_owner_created ON music_jobs(owner_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_music_jobs_status_updated ON music_jobs(status,updated_at);
CREATE TABLE IF NOT EXISTS music_tracks (
 id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT NOT NULL,
 title TEXT NOT NULL,
 duration_seconds REAL NOT NULL CHECK(duration_seconds > 0),
 format TEXT NOT NULL CHECK(format='mp3'),
 storage_key TEXT NOT NULL UNIQUE,
 byte_length INTEGER NOT NULL CHECK(byte_length > 0),
 sha256_hex TEXT NOT NULL CHECK(length(sha256_hex)=64),
 rights_metadata_json TEXT NOT NULL DEFAULT '{}',
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_music_tracks_owner_created ON music_tracks(owner_id,created_at DESC);
CREATE TABLE IF NOT EXISTS music_uploads (
 id TEXT PRIMARY KEY NOT NULL,
 owner_id TEXT NOT NULL,
 original_filename TEXT NOT NULL,
 mime_type TEXT NOT NULL CHECK(mime_type IN ('audio/mpeg','audio/wav','audio/x-wav','audio/mp4')),
 size_bytes INTEGER NOT NULL CHECK(size_bytes BETWEEN 1 AND 26214400),
 storage_key TEXT NOT NULL UNIQUE,
 rights_confirmed_at INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_music_uploads_owner_created ON music_uploads(owner_id,created_at DESC);
