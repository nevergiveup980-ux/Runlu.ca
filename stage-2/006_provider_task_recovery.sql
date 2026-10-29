-- RUNLU STAGE: durable provider submission tracking; draft, NOT deployed.
-- Apply after persistence-schema.sql and 002_attempts.sql.
-- 002_attempts.sql already defines provider_task_id and UNIQUE(provider,provider_task_id).
ALTER TABLE stage_attempts
 ADD COLUMN IF NOT EXISTS submission_state TEXT NOT NULL DEFAULT 'NOT_SENT'
   CHECK (submission_state IN ('NOT_SENT','SUBMITTING','SUBMITTED','UNKNOWN','RECONCILED')),
 ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS stage_attempts_recovery_idx
 ON stage_attempts(submission_state,created_at)
 WHERE submission_state IN ('SUBMITTING','SUBMITTED','UNKNOWN');
-- Before a provider request, commit SUBMITTING durably. A crash/timeout
-- after this point is ambiguous; do not blindly resubmit.
-- Persist returned task ID before polling. Reconcile unknown outcomes.
-- This schema alone does not implement the transactional worker protocol.
