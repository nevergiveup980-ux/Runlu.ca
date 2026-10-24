-- RUNLU STAGE prototype PostgreSQL persistence schema; migration draft, NOT deployed.
CREATE TABLE IF NOT EXISTS stage_jobs (
 id UUID PRIMARY KEY,
 owner_id UUID NOT NULL,
 idempotency_key TEXT NOT NULL,
 request_json JSONB NOT NULL,
 status TEXT NOT NULL CHECK (status IN ('QUEUED','RUNNING','RECONCILIATION_REQUIRED','BUDGET_BLOCKED','FAILED','SIMULATED_COMPLETE','VERIFYING','VERIFIED')),
 budget_cents BIGINT NOT NULL CHECK (budget_cents > 0),
 spent_cents BIGINT NOT NULL DEFAULT 0 CHECK (spent_cents >= 0),
 reserved_cents BIGINT NOT NULL DEFAULT 0 CHECK (reserved_cents >= 0),
 attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
 lease_owner TEXT,
 lease_until TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(owner_id,idempotency_key),
 CHECK(spent_cents <= budget_cents AND reserved_cents <= budget_cents - spent_cents)
);
CREATE INDEX IF NOT EXISTS stage_jobs_queue_idx ON stage_jobs(status,created_at) WHERE status='QUEUED';
CREATE TABLE IF NOT EXISTS stage_job_events (
 id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 job_id UUID NOT NULL REFERENCES stage_jobs(id),
 event_type TEXT NOT NULL,
 details JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS stage_job_events_job_idx ON stage_job_events(job_id,id);
CREATE TABLE IF NOT EXISTS stage_assets (
 id UUID PRIMARY KEY,
 job_id UUID NOT NULL REFERENCES stage_jobs(id),
 state TEXT NOT NULL CHECK(state IN ('INGESTING','QUARANTINED','VERIFIED','REJECTED')),
 storage_key TEXT NOT NULL UNIQUE,
 sha256 CHAR(64) NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 bytes BIGINT NOT NULL CHECK(bytes > 0),
 metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Application service role must enforce owner authorization on every read/write.
-- Configure RLS policies and separate privileged worker role before any exposure.
