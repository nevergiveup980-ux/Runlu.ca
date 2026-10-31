-- RUNLU STAGE private ingest queue, draft only. Not deployed.
-- Apply after 002_attempts.sql. Worker must use a restricted DB role.
CREATE TABLE IF NOT EXISTS stage_ingest_jobs (
 provider TEXT NOT NULL,
 provider_task_id TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'QUEUED' CHECK (state IN ('QUEUED','PROCESSING','VERIFIED','FAILED')),
 attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
 lease_owner TEXT,
 lease_until TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(provider,provider_task_id),
 FOREIGN KEY(provider,provider_task_id) REFERENCES stage_attempts(provider,provider_task_id)
);
CREATE INDEX IF NOT EXISTS stage_ingest_queue_idx ON stage_ingest_jobs(created_at) WHERE state='QUEUED';
-- No signed provider URLs in this table: the worker retrieves fresh output URLs
-- from the provider using the task ID immediately before private ingestion.
