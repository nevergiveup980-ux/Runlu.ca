-- Run against a disposable CI database only.
BEGIN;
INSERT INTO stage_director_approvals(episode_id,content_digest,reviewer_id,approved_snapshot)
VALUES('pilot',repeat('a',64),'editor','{}');
INSERT INTO stage_director_budgets(episode_id,limit_cents,confirmed_by)
VALUES('pilot',1000,'editor');
INSERT INTO stage_director_shot_jobs(episode_id,shot_id)
VALUES('pilot','shot1');
INSERT INTO stage_director_attempts(attempt_id,episode_id,shot_id,estimated_cents)
VALUES('attempt1','pilot','shot1',500);
INSERT INTO stage_director_submission_outbox(attempt_id)
VALUES('attempt1');
INSERT INTO stage_director_charge_audit(attempt_id,provider_charge_reference,charged_cents,recorded_by)
VALUES('attempt1','providercharge1',450,'editor');
DO $$
BEGIN
 IF (SELECT count(*) FROM stage_director_attempts WHERE episode_id='pilot')<>1 THEN
  RAISE EXCEPTION 'Attempt FK smoke test failed';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='stage_director_outbox_provider_task_unique') THEN
  RAISE EXCEPTION 'Missing provider task unique index';
 END IF;
END $$;
ROLLBACK;
