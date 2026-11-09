-- RUNLU MUSIC isolated PostgreSQL concurrency fixture.
-- Run ONLY in disposable local database, never in production.
BEGIN;
CREATE SCHEMA IF NOT EXISTS music_test;
CREATE TABLE music_test.wallets(user_id uuid PRIMARY KEY,credits integer NOT NULL CHECK(credits>=0));
CREATE TABLE music_test.jobs(
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL,
 request_key text NOT NULL,
 payload text NOT NULL,
 status text NOT NULL DEFAULT 'queued',
 UNIQUE(user_id,request_key)
);
CREATE TABLE music_test.consumptions(
 job_id bigint PRIMARY KEY REFERENCES music_test.jobs(id),
 user_id uuid NOT NULL,
 units integer NOT NULL CHECK(units=1)
);
CREATE OR REPLACE FUNCTION music_test.reserve(p_user uuid,p_key text,p_payload text,p_inject_failure boolean DEFAULT false)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE v_id bigint; v_old_payload text;
BEGIN
 IF p_key IS NULL OR length(p_key)<8 OR p_payload IS NULL THEN
   RAISE EXCEPTION 'INVALID_REQUEST';
 END IF;
 -- Serialize requests per account before looking up idempotency or balance.
 PERFORM 1 FROM music_test.wallets WHERE user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'NO_WALLET'; END IF;
 SELECT id,payload INTO v_id,v_old_payload FROM music_test.jobs
 WHERE user_id=p_user AND request_key=p_key;
 IF FOUND THEN
   IF v_old_payload IS DISTINCT FROM p_payload THEN
     RAISE EXCEPTION 'IDEMPOTENCY_PAYLOAD_MISMATCH';
   END IF;
   RETURN v_id;
 END IF;
 UPDATE music_test.wallets SET credits=credits-1
 WHERE user_id=p_user AND credits>=1;
 IF NOT FOUND THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
 IF p_inject_failure THEN RAISE EXCEPTION 'INJECTED_JOB_INSERT_FAILURE'; END IF;
 INSERT INTO music_test.jobs(user_id,request_key,payload)
 VALUES(p_user,p_key,p_payload) RETURNING id INTO v_id;
 INSERT INTO music_test.consumptions(job_id,user_id,units) VALUES(v_id,p_user,1);
 RETURN v_id;
END $$;
COMMIT;
