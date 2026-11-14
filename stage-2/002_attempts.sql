-- Apply AFTER persistence-schema.sql. Draft only; NOT deployed.
CREATE TABLE IF NOT EXISTS stage_attempts (
 id UUID PRIMARY KEY,
 job_id UUID NOT NULL REFERENCES stage_jobs(id),
 provider TEXT NOT NULL,
 provider_task_id TEXT,
 status TEXT NOT NULL CHECK (status IN ('RESERVED','SUBMITTING','SUBMITTED','SETTLED','RECONCILIATION_REQUIRED')),
 reserved_cents BIGINT NOT NULL CHECK (reserved_cents > 0),
 billed_cents BIGINT CHECK (billed_cents >= 0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(job_id,id),
 UNIQUE(provider,provider_task_id)
);
CREATE INDEX IF NOT EXISTS stage_attempts_job_idx ON stage_attempts(job_id);
-- The provider task id is nullable until known. If submission times out,
-- do NOT submit again until reconciled with provider.
