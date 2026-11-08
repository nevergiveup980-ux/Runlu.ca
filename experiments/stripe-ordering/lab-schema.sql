-- ISOLATED FIXTURE ONLY: not a production migration or existing RUNLU schema.
CREATE ROLE runlu_lab_service NOLOGIN BYPASSRLS;
CREATE ROLE runlu_lab_anon NOLOGIN;
CREATE ROLE runlu_lab_authenticated NOLOGIN;
CREATE SCHEMA runlu_stripe_lab;
REVOKE ALL ON SCHEMA runlu_stripe_lab FROM PUBLIC;
CREATE TABLE runlu_stripe_lab.subscriptions (
  ref text PRIMARY KEY, revision bigint NOT NULL CHECK (revision > 0), body jsonb NOT NULL
);
CREATE TABLE runlu_stripe_lab.receipts (
  id text PRIMARY KEY, subscription text NOT NULL, payload_hash text NOT NULL,
  disposition text NOT NULL CHECK (disposition IN ('applied','stale'))
);
CREATE TABLE runlu_stripe_lab.entitlements (
  ref text PRIMARY KEY, active boolean NOT NULL, expires bigint NOT NULL
);
CREATE TABLE runlu_stripe_lab.effects (event_id text PRIMARY KEY, ref text NOT NULL);
ALTER TABLE runlu_stripe_lab.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE runlu_stripe_lab.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE runlu_stripe_lab.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE runlu_stripe_lab.effects ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION runlu_stripe_lab.commit_subscription(p_event jsonb, p_revision bigint, p_next jsonb)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  s runlu_stripe_lab.subscriptions%rowtype;
  r runlu_stripe_lab.receipts%rowtype;
  event_id text := p_event->>'id';
  v_ref text := p_event->>'subscription';
  event_created bigint;
  disposition text;
BEGIN
  -- Booleans are trusted adapter inputs, never HTTP client authorization.
  IF p_event->>'verified' IS DISTINCT FROM 'true' OR p_event->>'correlated' IS DISTINCT FROM 'true'
    OR event_id IS NULL OR event_id !~ '^evt_[A-Za-z0-9]+$'
    OR v_ref IS NULL OR v_ref !~ '^sub_[A-Za-z0-9]+$'
    OR p_event->>'payloadHash' IS NULL OR p_event->>'payloadHash' !~ '^[0-9a-f]{64}$'
    OR p_event->>'created' IS NULL OR p_event->>'created' !~ '^[1-9][0-9]*$'
    OR p_revision IS NULL OR p_revision < 0
    OR p_event->>'type' IS NULL OR p_event->>'type' NOT IN (
      'customer.subscription.created','customer.subscription.updated','customer.subscription.deleted',
      'invoice.paid','invoice.payment_failed','checkout.session.completed') THEN
    RAISE EXCEPTION 'invalid_verified_event';
  END IF;
  event_created := (p_event->>'created')::bigint;
  IF event_created > 9007199254740991 THEN RAISE EXCEPTION 'invalid_event_clock'; END IF;
  -- Consistent event-then-subscription lock order. Advisory subscription lock
  -- also fences an absent row: SELECT FOR UPDATE alone cannot lock first creation.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('event:' || event_id,0));
  SELECT * INTO r FROM runlu_stripe_lab.receipts WHERE id=event_id;
  IF FOUND THEN
    IF r.subscription <> v_ref OR r.payload_hash <> p_event->>'payloadHash' THEN
      RAISE EXCEPTION 'event_identity_conflict';
    END IF;
    RETURN 'duplicate';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('subscription:' || v_ref,0));
  SELECT * INTO s FROM runlu_stripe_lab.subscriptions WHERE subscriptions.ref=v_ref FOR UPDATE;
  IF coalesce(s.revision,0) <> p_revision THEN RETURN 'conflict'; END IF;
  IF s.body IS NOT NULL AND event_created < (s.body->'clock'->>'created')::bigint THEN
    disposition := 'stale';
  ELSE
    IF p_next IS NULL OR p_next='null'::jsonb
      OR p_next->>'status' IS NULL OR p_next->>'status' NOT IN (
        'active','trialing','past_due','unpaid','paused','canceled','incomplete','incomplete_expired')
      OR coalesce(p_next->>'periodStart','') !~ '^[1-9][0-9]*$'
      OR coalesce(p_next->>'periodEnd','') !~ '^[1-9][0-9]*$'
      OR jsonb_typeof(p_next->'cancelAtPeriodEnd') IS DISTINCT FROM 'boolean' THEN
      RAISE EXCEPTION 'invalid_subscription_snapshot';
    END IF;
    IF (p_next->>'periodEnd')::bigint <= (p_next->>'periodStart')::bigint THEN
      RAISE EXCEPTION 'invalid_subscription_period';
    END IF;
    IF s.body->>'status' IN ('canceled','incomplete_expired')
      AND s.body->>'status' IS DISTINCT FROM p_next->>'status' THEN
      RAISE EXCEPTION 'terminal_subscription_conflict';
    END IF;
    INSERT INTO runlu_stripe_lab.subscriptions VALUES(v_ref,p_revision+1,
      p_next || jsonb_build_object('clock',jsonb_build_object('id',event_id,'created',event_created)))
      ON CONFLICT (ref) DO UPDATE SET revision=excluded.revision,body=excluded.body;
    -- Fixture entitlement policy. Production integration must call existing
    -- reviewed RUNLU normalization/fulfillment routines inside this transaction.
    INSERT INTO runlu_stripe_lab.entitlements VALUES(v_ref,
      p_next->>'status' IN ('active','trialing'), (p_next->>'periodEnd')::bigint)
      ON CONFLICT (ref) DO UPDATE SET active=excluded.active,expires=excluded.expires;
    INSERT INTO runlu_stripe_lab.effects VALUES(event_id,v_ref);
    disposition := 'applied';
  END IF;
  INSERT INTO runlu_stripe_lab.receipts VALUES(event_id,v_ref,p_event->>'payloadHash',disposition);
  RETURN disposition;
END;
$$;
REVOKE ALL ON ALL TABLES IN SCHEMA runlu_stripe_lab FROM PUBLIC;
REVOKE ALL ON FUNCTION runlu_stripe_lab.commit_subscription(jsonb,bigint,jsonb) FROM PUBLIC;
GRANT USAGE ON SCHEMA runlu_stripe_lab TO runlu_lab_service;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA runlu_stripe_lab TO runlu_lab_service;
GRANT EXECUTE ON FUNCTION runlu_stripe_lab.commit_subscription(jsonb,bigint,jsonb) TO runlu_lab_service;
