-- RUNLU STAGE: durable provider-task identity; draft migration, not deployed.
-- Run after persistence-schema.sql and 002_attempts.sql.
ALTER TABLE stage_attempts
 ADD COLUMN IF NOT EXISTS provider_task_id TEXT,
 ADD COLUMN IF NOT EXISTS submission_state TEXT NOT NULL DEFAULT 'NOT_SENT'
   CHECK (submission_state IN ('NOT_SENT','SUBMITTING','SUBMITTED','UNKNOWN','RECONCILED')),
 ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS stage_attempts_provider_task_unique
 ON stage_attempts(provider,provider_task_id)
 WHERE provider_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stage_attempts_recovery_idx
 ON stage_attempts(submission_state,created_at)
 WHERE submission_state IN ('SUBMITTING','SUBMITTED','UNKNOWN');
-- Before a network call, commit SUBMITTING durably. A crash/timeout thereafter
-- must be treated as UNKNOWN, never as proof the request was not sent.
-- After receiving a task ID, persist it before polling or returning success.
-- A worker must reconcile uncertain submissions before issuing any replacement.
