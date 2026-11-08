-- Isolated candidate; not a production migration. Requires disposable fixtures.
CREATE TABLE runlu_stripe_lab.bindings(ref text PRIMARY KEY, subscription_id uuid NOT NULL UNIQUE REFERENCES public.runlu_subscriptions(id));
ALTER TABLE runlu_stripe_lab.bindings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON runlu_stripe_lab.bindings TO runlu_lab_service;

-- Authoritative reconciliation may supersede legacy same-second type ranks ONLY
-- when tied to the current fenced revision, trusted binding and verified receipt.
CREATE FUNCTION public.runlu_lab_authoritative_event(p_event_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT EXISTS (
   SELECT 1 FROM public.runlu_commerce_events e
   JOIN public.runlu_webhook_receipts r ON r.id=e.webhook_receipt_id
   JOIN runlu_stripe_lab.bindings b ON b.subscription_id=e.subscription_id
   JOIN runlu_stripe_lab.subscriptions c ON c.ref=b.ref
   WHERE e.id=p_event_id AND e.source='stripe' AND r.signature_verified
     AND r.status='processing' AND r.provider_event_id=e.provider_event_id
     AND c.body->'clock'->>'id'=e.provider_event_id
     AND e.metadata->>'runlu_authoritative_revision'=c.revision::text
 );
$$;

CREATE FUNCTION runlu_stripe_lab.commit_runlu_subscription(p_event jsonb,p_revision bigint,p_next jsonb)
RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  v_outcome text;
  v_receipt uuid;
  v_event uuid;
  v_run uuid;
  v_sub public.runlu_subscriptions%rowtype;
  v_old public.runlu_webhook_receipts%rowtype;
  v_status text;
  v_canonical text;
  v_start timestamptz;
  v_end timestamptz;
BEGIN
  -- The inner guard is the tested revision/receipt clock boundary. All its local
  -- writes and all sourced RUNLU RPC writes below share this one SQL transaction.
  v_outcome:=runlu_stripe_lab.commit_subscription(p_event,p_revision,p_next);
  IF v_outcome='conflict' THEN RETURN v_outcome; END IF;
  SELECT s.* INTO v_sub FROM public.runlu_subscriptions s
    JOIN runlu_stripe_lab.bindings b ON b.subscription_id=s.id
    WHERE b.ref=p_event->>'subscription' FOR UPDATE OF s;
  IF NOT FOUND OR v_sub.payment_provider<>'stripe' THEN RAISE EXCEPTION 'trusted_subscription_binding_missing'; END IF;
  SELECT * INTO v_old FROM public.runlu_webhook_receipts
    WHERE provider='stripe' AND provider_event_id=p_event->>'id' FOR UPDATE;
  IF FOUND THEN
    IF v_old.payload_sha256 IS DISTINCT FROM p_event->>'payloadHash'
      OR v_old.event_type IS DISTINCT FROM p_event->>'type' THEN RAISE EXCEPTION 'event_identity_conflict'; END IF;
    IF v_old.manual_review_required OR v_old.next_retry_at>now()
      OR (v_old.status='processing' AND v_old.processing_started_at>now()-interval '15 minutes') THEN
      RAISE EXCEPTION 'receipt_busy_or_review';
    END IF;
    IF v_old.status='processed' THEN
      IF v_outcome<>'duplicate' THEN RAISE EXCEPTION 'clock_receipt_inconsistent'; END IF;
      RETURN 'duplicate';
    END IF;
  END IF;
  IF v_outcome='duplicate' THEN RAISE EXCEPTION 'receipt_completion_missing'; END IF;
  v_receipt:=public.runlu_record_webhook_receipt('stripe',p_event->>'id',p_event->>'type',p_event->>'payloadHash',true,null);
  IF NOT public.runlu_claim_webhook_receipt(v_receipt) THEN RAISE EXCEPTION 'receipt_not_claimed'; END IF;
  IF v_outcome='stale' THEN
    PERFORM public.runlu_complete_webhook_receipt(v_receipt,null,'acknowledged_noop','Stale subscription event; no subscription or entitlement write.');
    RETURN 'stale';
  END IF;
  v_status:=CASE p_next->>'status' WHEN 'active' THEN 'active' WHEN 'trialing' THEN 'active'
    WHEN 'past_due' THEN 'past_due' WHEN 'unpaid' THEN 'past_due' WHEN 'canceled' THEN 'expired'
    WHEN 'incomplete_expired' THEN 'expired' ELSE null END;
  IF v_status IS NULL THEN RAISE EXCEPTION 'snapshot_requires_explicit_policy'; END IF;
  v_start:=to_timestamp((p_next->>'periodStart')::double precision);
  v_end:=to_timestamp((p_next->>'periodEnd')::double precision);
  -- RUNLU expiration trigger requires an ended period. This is the effective
  -- access cutoff; the original Stripe snapshot remains in the fenced clock row.
  IF v_status='expired' THEN v_end:=least(v_end,now()); v_start:=least(v_start,v_end-interval '1 second'); END IF;
  UPDATE public.runlu_subscriptions SET status=v_status,current_period_start=v_start,current_period_end=v_end,
    cancel_at_period_end=CASE WHEN v_status='expired' THEN false ELSE (p_next->>'cancelAtPeriodEnd')::boolean END
    WHERE id=v_sub.id;
  v_canonical:=CASE v_status WHEN 'expired' THEN 'subscription.expired' WHEN 'past_due' THEN 'subscription.past_due'
    ELSE CASE WHEN p_event->>'type'='invoice.paid' THEN 'subscription_renewed' ELSE 'subscription_activated' END END;
  v_event:=public.runlu_normalize_webhook_event(v_receipt,v_canonical,v_sub.user_id,null,v_sub.id,
    v_sub.product_key,v_sub.plan_key,to_timestamp((p_event->>'created')::double precision),(p_event->>'created')::bigint);
  UPDATE public.runlu_commerce_events SET metadata=metadata||jsonb_build_object('runlu_authoritative_revision',p_revision+1) WHERE id=v_event;
  v_run:=public.runlu_orchestrate_fulfillment(v_event);
  IF v_run IS NULL OR NOT EXISTS(SELECT 1 FROM public.runlu_commerce_events WHERE id=v_event AND event_status='processed') THEN
    RAISE EXCEPTION 'fulfillment_not_applied';
  END IF;
  PERFORM public.runlu_complete_webhook_receipt(v_receipt,v_event,'fulfilled','Authoritative subscription snapshot committed with RUNLU fulfillment.');
  RETURN 'applied';
END;
$$;
REVOKE ALL ON FUNCTION public.runlu_lab_authoritative_event(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION runlu_stripe_lab.commit_runlu_subscription(jsonb,bigint,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION runlu_stripe_lab.commit_runlu_subscription(jsonb,bigint,jsonb) TO runlu_lab_service;
GRANT SELECT,INSERT,UPDATE ON ALL TABLES IN SCHEMA public TO runlu_lab_service;
