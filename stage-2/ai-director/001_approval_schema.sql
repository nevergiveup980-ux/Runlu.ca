-- RUNLU STAGE AI Director v1: additive migration, not applied automatically.
CREATE TABLE IF NOT EXISTS stage_director_approvals (
  episode_id text PRIMARY KEY,
  content_digest char(64) NOT NULL CHECK (content_digest ~ '^[0-9a-f]{64}$'),
  reviewer_id text NOT NULL,
  approved_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS stage_director_shot_jobs (
  episode_id text NOT NULL REFERENCES stage_director_approvals(episode_id),
  shot_id text NOT NULL,
  state text NOT NULL DEFAULT 'READY' CHECK (state IN ('READY','RESERVED','SUBMITTED','UNKNOWN','FAILED','SUCCEEDED')),
  character_revision_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  attempt_id text,
  output_asset_id text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (episode_id,shot_id),
  UNIQUE (attempt_id)
);
-- Apply RLS and app-specific roles before exposing tables via Supabase APIs.
