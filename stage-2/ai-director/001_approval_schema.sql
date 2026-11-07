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

-- Budget is approved explicitly by the user before any shot is reserved.
CREATE TABLE IF NOT EXISTS stage_director_budgets (
  episode_id text PRIMARY KEY REFERENCES stage_director_approvals(episode_id),
  limit_cents bigint NOT NULL CHECK (limit_cents > 0),
  confirmed_by text NOT NULL,
  confirmed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS stage_director_attempts (
  attempt_id text PRIMARY KEY,
  episode_id text NOT NULL,
  shot_id text NOT NULL,
  estimated_cents bigint NOT NULL CHECK (estimated_cents > 0),
  charged_cents bigint CHECK (charged_cents >= 0),
  state text NOT NULL DEFAULT 'RESERVED'
    CHECK (state IN ('RESERVED','SUBMITTED','UNKNOWN','SETTLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (episode_id,shot_id)
    REFERENCES stage_director_shot_jobs(episode_id,shot_id)
);
CREATE INDEX IF NOT EXISTS stage_director_attempts_episode_idx
 ON stage_director_attempts(episode_id);

-- Outbox: persisted intent before any external paid API request.
-- Dispatchers must never blindly replay a possibly submitted request.
CREATE TABLE IF NOT EXISTS stage_director_submission_outbox (
  attempt_id text PRIMARY KEY REFERENCES stage_director_attempts(attempt_id),
  state text NOT NULL DEFAULT 'PENDING'
    CHECK (state IN ('PENDING','DISPATCHING','SUBMITTED','UNKNOWN','CANCELLED')),
  provider_task_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stage_director_submission_outbox_state_idx
 ON stage_director_submission_outbox(state,updated_at);

-- Provider task identity must be unique when known, preventing one provider job
-- from being attached to multiple attempts.
CREATE UNIQUE INDEX IF NOT EXISTS stage_director_outbox_provider_task_unique
 ON stage_director_submission_outbox(provider_task_id)
 WHERE provider_task_id IS NOT NULL;

-- Audit the provider's actual charge; zero-cost outcomes are recorded explicitly.
-- This is an additive schema extension, not automatically deployed.
CREATE TABLE IF NOT EXISTS stage_director_charge_audit (
  attempt_id text PRIMARY KEY REFERENCES stage_director_attempts(attempt_id),
  provider_charge_reference text NOT NULL UNIQUE,
  charged_cents bigint NOT NULL CHECK (charged_cents >= 0),
  recorded_by text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- Actual provider charges must be recorded even when they exceed approved budget.
-- A financial exception is an alert, not a reason to erase an external charge.
ALTER TABLE stage_director_charge_audit
 ADD COLUMN IF NOT EXISTS exceeds_approved_budget boolean NOT NULL DEFAULT false;
ALTER TABLE stage_director_charge_audit
 ADD COLUMN IF NOT EXISTS reconciliation_note text;

-- A provider overcharge freezes future reservations for this episode.
-- Explicit administrative review is required to resume; never auto-increase the budget.
ALTER TABLE stage_director_budgets
 ADD COLUMN IF NOT EXISTS spending_paused boolean NOT NULL DEFAULT false;
ALTER TABLE stage_director_budgets
 ADD COLUMN IF NOT EXISTS pause_reason text;
ALTER TABLE stage_director_budgets
 ADD COLUMN IF NOT EXISTS paused_at timestamptz;

-- Explicit audit of administrative budget pause/resume decisions.
-- Resume is only allowed if all reconciled commitments fit the existing limit.
CREATE TABLE IF NOT EXISTS stage_director_spending_decisions (
  decision_id text PRIMARY KEY,
  episode_id text NOT NULL REFERENCES stage_director_budgets(episode_id),
  action text NOT NULL CHECK (action IN ('RESUME')),
  reviewer_id text NOT NULL,
  reason text NOT NULL CHECK (length(trim(reason)) >= 10),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
