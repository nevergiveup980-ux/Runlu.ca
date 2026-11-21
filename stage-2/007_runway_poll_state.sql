-- RUNLU STAGE task polling state. Draft only; not deployed.
-- Apply after 002_attempts.sql and 006_provider_task_recovery.sql.
ALTER TABLE stage_attempts
 ADD COLUMN IF NOT EXISTS provider_poll_state TEXT
 CHECK (provider_poll_state IN ('WAITING','READY_FOR_INGEST','FAILED')),
 ADD COLUMN IF NOT EXISTS last_polled_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS stage_attempts_poll_idx
 ON stage_attempts(provider_poll_state,last_polled_at)
 WHERE submission_state='SUBMITTED';
-- Do not store provider's temporary signed URLs in job events or public JSON.
-- Asset ingest worker must receive these URLs through a restricted private channel.
