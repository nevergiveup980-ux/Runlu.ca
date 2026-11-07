-- Real PostgreSQL transactional behavior smoke tests, disposable CI database.
-- Fail immediately on any unexpected result.
BEGIN;
INSERT INTO stage_director_approvals(episode_id,content_digest,reviewer_id,approved_snapshot)
 VALUES('txpilot',repeat('b',64),'editor','{}');
INSERT INTO stage_director_budgets(episode_id,limit_cents,confirmed_by)
 VALUES('txpilot',1000,'editor');
INSERT INTO stage_director_shot_jobs(episode_id,shot_id)
 VALUES('txpilot','shot1'),('txpilot','shot2');
INSERT INTO stage_director_attempts(attempt_id,episode_id,shot_id,estimated_cents)
 VALUES('tx_attempt1','txpilot','shot1',600);
UPDATE stage_director_shot_jobs SET state='RESERVED',attempt_id='tx_attempt1'
 WHERE episode_id='txpilot' AND shot_id='shot1' AND state='READY';
DO $$
DECLARE n integer;
BEGIN
 SELECT count(*) INTO n FROM stage_director_shot_jobs
  WHERE episode_id='txpilot' AND shot_id='shot1' AND state='RESERVED';
 IF n<>1 THEN RAISE EXCEPTION 'Initial claim failed'; END IF;
END $$;
-- Second claim is a no-op, not a second reservation.
UPDATE stage_director_shot_jobs SET state='RESERVED',attempt_id='tx_attempt2'
 WHERE episode_id='txpilot' AND shot_id='shot1' AND state='READY';
DO $$
BEGIN
 IF (SELECT attempt_id FROM stage_director_shot_jobs
     WHERE episode_id='txpilot' AND shot_id='shot1')<>'tx_attempt1' THEN
  RAISE EXCEPTION 'Duplicate claim was accepted';
 END IF;
END $$;
SAVEPOINT rollback_probe;
INSERT INTO stage_director_attempts(attempt_id,episode_id,shot_id,estimated_cents)
 VALUES('tx_rollback','txpilot','shot2',300);
ROLLBACK TO SAVEPOINT rollback_probe;
DO $$
BEGIN
 IF EXISTS(SELECT 1 FROM stage_director_attempts WHERE attempt_id='tx_rollback') THEN
  RAISE EXCEPTION 'Savepoint rollback did not revert attempt';
 END IF;
END $$;
ROLLBACK;
