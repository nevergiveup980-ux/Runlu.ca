#!/usr/bin/env bash
set -euo pipefail
# Disposable PostgreSQL CI only. Two independent psql sessions.
psql -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO stage_director_approvals(episode_id,content_digest,reviewer_id,approved_snapshot)
 VALUES('racepilot',repeat('c',64),'editor','{}');
INSERT INTO stage_director_budgets(episode_id,limit_cents,confirmed_by)
 VALUES('racepilot',1000,'editor');
INSERT INTO stage_director_shot_jobs(episode_id,shot_id)
 VALUES('racepilot','s1'),('racepilot','s2');
SQL
# First connection locks the budget and holds it for two seconds.
psql -v ON_ERROR_STOP=1 <<'SQL' > /tmp/stage-race-first.log 2>&1 &
BEGIN;
SET LOCAL application_name='stage_race_first';
SELECT limit_cents FROM stage_director_budgets WHERE episode_id='racepilot' FOR UPDATE;
INSERT INTO stage_director_attempts(attempt_id,episode_id,shot_id,estimated_cents)
 VALUES('race_a1','racepilot','s1',700);
UPDATE stage_director_shot_jobs SET state='RESERVED',attempt_id='race_a1'
 WHERE episode_id='racepilot' AND shot_id='s1' AND state='READY';
SELECT pg_sleep(2);
COMMIT;
SQL
first=$!
# Ensure the first transaction owns the budget row before starting the second.
for i in $(seq 1 50); do
  if psql -Atqc "SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE application_name='stage_race_first' AND query LIKE 'SELECT pg_sleep%' AND state='active')" | grep -qx t; then break; fi
  sleep 0.1
done
# The second connection must wait on the same budget row, then see 700 committed.
psql -v ON_ERROR_STOP=1 <<'SQL' > /tmp/stage-race-second.log 2>&1
BEGIN;
SET LOCAL lock_timeout='5s';
SELECT limit_cents FROM stage_director_budgets WHERE episode_id='racepilot' FOR UPDATE;
DO $$
DECLARE used bigint;
BEGIN
 SELECT COALESCE(SUM(CASE WHEN state='SETTLED' THEN charged_cents ELSE estimated_cents END),0)
 INTO used FROM stage_director_attempts WHERE episode_id='racepilot';
 IF used+700<=1000 THEN
   RAISE EXCEPTION 'Budget oversubscription race detected: %',used;
 END IF;
END $$;
COMMIT;
SQL
wait "$first"
psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
 IF (SELECT count(*) FROM stage_director_attempts WHERE episode_id='racepilot')<>1 THEN
  RAISE EXCEPTION 'Expected exactly one budget reservation';
 END IF;
 IF (SELECT attempt_id FROM stage_director_shot_jobs WHERE episode_id='racepilot' AND shot_id='s1')<>'race_a1' THEN
  RAISE EXCEPTION 'First shot claim missing';
 END IF;
END $$;
SQL
echo "Two-connection budget lock smoke test passed."
