-- Read-only pg_get_functiondef snapshot, 2026-11-08. No customer rows or secrets.
-- Test fixture only: NEVER load this file into a hosted or production database.
CREATE OR REPLACE FUNCTION public.runlu_apply_commerce_event_order_guard(p_event_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  ev public.runlu_commerce_events%rowtype;
  prev public.runlu_commerce_events%rowtype;
  v_entity_type text;
  v_entity_id uuid;
  v_current_rank integer;
  v_prev_rank integer;
  v_stale boolean := false;
begin
  select * into ev
  from public.runlu_commerce_events
  where id = p_event_id
  for update;

  if not found then
    raise exception 'Commerce event not found';
  end if;

  if ev.event_status = 'processed' then
    return true;
  end if;

  if ev.event_status = 'ignored' and ev.ordering_status = 'stale' then
    return false;
  end if;

  if ev.subscription_id is not null then
    v_entity_type := 'subscription';
    v_entity_id := ev.subscription_id;
  elsif ev.order_id is not null then
    v_entity_type := 'order';
    v_entity_id := ev.order_id;
  else
    update public.runlu_commerce_events
       set ordering_status = 'unordered', ordering_note = 'No order or subscription entity to sequence'
     where id = ev.id;
    return true;
  end if;

  -- External provider events must carry a provider clock or monotonic sequence.
  if ev.provider_event_id is not null
     and lower(ev.source) not in ('system','manual','owner_seed')
     and ev.provider_occurred_at is null
     and ev.provider_sequence is null then
    update public.runlu_commerce_events
       set ordering_status = 'missing_clock',
           ordering_note = 'External provider event lacks provider_occurred_at/provider_sequence',
           event_status = 'failed'
     where id = ev.id;
    return false;
  end if;

  if ev.provider_occurred_at is null and ev.provider_sequence is null then
    update public.runlu_commerce_events
       set ordering_status = 'unordered', ordering_note = 'Local event has no provider ordering metadata'
     where id = ev.id;
    return true;
  end if;

  -- Serialize ordering decisions per provider + entity inside the transaction.
  perform pg_advisory_xact_lock(hashtextextended(lower(ev.source) || ':' || v_entity_type || ':' || v_entity_id::text, 0));

  if v_entity_type = 'subscription' then
    select * into prev
    from public.runlu_commerce_events e
    where e.id <> ev.id
      and lower(e.source) = lower(ev.source)
      and e.subscription_id = v_entity_id
      and e.event_status = 'processed'
      and (e.provider_sequence is not null or e.provider_occurred_at is not null)
    order by e.provider_sequence desc nulls last, e.provider_occurred_at desc nulls last, e.created_at desc
    limit 1;
  else
    select * into prev
    from public.runlu_commerce_events e
    where e.id <> ev.id
      and lower(e.source) = lower(ev.source)
      and e.order_id = v_entity_id
      and e.event_status = 'processed'
      and (e.provider_sequence is not null or e.provider_occurred_at is not null)
    order by e.provider_sequence desc nulls last, e.provider_occurred_at desc nulls last, e.created_at desc
    limit 1;
  end if;

  if found then
    if ev.provider_sequence is not null and prev.provider_sequence is not null then
      v_stale := ev.provider_sequence < prev.provider_sequence;
    elsif ev.provider_occurred_at is not null and prev.provider_occurred_at is not null then
      if ev.provider_occurred_at < prev.provider_occurred_at then
        v_stale := true;
      elsif ev.provider_occurred_at = prev.provider_occurred_at then
        v_current_rank := case ev.event_type
          when 'payment.refunded' then 100
          when 'order.refunded' then 100
          when 'subscription.expired' then 90
          when 'order.cancelled' then 80
          when 'subscription.cancelled' then 80
          when 'subscription.past_due' then 70
          when 'subscription_renewed' then 60
          when 'subscription_activated' then 50
          when 'order_paid' then 40
          when 'payment_succeeded' then 40
          else 10 end;
        v_prev_rank := case prev.event_type
          when 'payment.refunded' then 100
          when 'order.refunded' then 100
          when 'subscription.expired' then 90
          when 'order.cancelled' then 80
          when 'subscription.cancelled' then 80
          when 'subscription.past_due' then 70
          when 'subscription_renewed' then 60
          when 'subscription_activated' then 50
          when 'order_paid' then 40
          when 'payment_succeeded' then 40
          else 10 end;
        v_stale := v_current_rank < v_prev_rank;
      end if;
    end if;
  end if;

  if v_stale then
    update public.runlu_commerce_events
       set ordering_status = 'stale',
           ordering_note = 'Older than an already processed provider event for the same entity',
           event_status = 'ignored'
     where id = ev.id;
    return false;
  end if;

  update public.runlu_commerce_events
     set ordering_status = 'accepted', ordering_note = null
   where id = ev.id;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_assess_commerce_event_ordering(p_event_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare ev public.runlu_commerce_events%rowtype; v_status text; v_rank int; 
begin
 select * into ev from public.runlu_commerce_events where id=p_event_id for update;
 if not found then raise exception 'Commerce event not found'; end if;
 if ev.provider_occurred_at is null and ev.provider_sequence is null then v_status:='missing_clock'; return v_status; end if;
 v_rank:=case ev.event_type when 'payment.refunded' then 100 when 'order.refunded' then 100 when 'subscription.expired' then 90 when 'order.cancelled' then 80 when 'subscription.cancelled' then 80 when 'subscription.past_due' then 70 when 'subscription_renewed' then 60 when 'subscription_activated' then 50 when 'order_paid' then 40 when 'payment_succeeded' then 40 else 10 end;
 if exists(
   select 1 from public.runlu_commerce_events n
   where n.id<>ev.id and lower(n.source)=lower(ev.source) and n.event_status in ('recorded','processed')
   and ((ev.subscription_id is not null and n.subscription_id=ev.subscription_id) or (ev.subscription_id is null and ev.order_id is not null and n.order_id=ev.order_id))
   and (
     (ev.provider_sequence is not null and n.provider_sequence is not null and n.provider_sequence>ev.provider_sequence)
     or
     (ev.provider_occurred_at is not null and n.provider_occurred_at>ev.provider_occurred_at)
     or
     (ev.provider_occurred_at is not null and n.provider_occurred_at=ev.provider_occurred_at and
       (case n.event_type when 'payment.refunded' then 100 when 'order.refunded' then 100 when 'subscription.expired' then 90 when 'order.cancelled' then 80 when 'subscription.cancelled' then 80 when 'subscription.past_due' then 70 when 'subscription_renewed' then 60 when 'subscription_activated' then 50 when 'order_paid' then 40 when 'payment_succeeded' then 40 else 10 end)>v_rank)
   )
 ) then v_status:='stale'; else v_status:='accepted'; end if;
 update public.runlu_commerce_events set ordering_status=v_status,ordering_note=case when v_status='stale' then 'Older or lower-precedence than another provider event for the same entity' else null end where id=ev.id;
 return v_status;
end $function$;

CREATE OR REPLACE FUNCTION public.runlu_claim_webhook_receipt(p_receipt_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.runlu_webhook_receipts%rowtype;
begin
  select * into r from public.runlu_webhook_receipts where id=p_receipt_id for update;
  if not found then raise exception 'webhook receipt not found'; end if;
  if r.status='processed' then return false; end if;
  if r.signature_verified is not true then raise exception 'webhook signature is not verified'; end if;
  if r.manual_review_required then return false; end if;
  if r.next_retry_at is not null and r.next_retry_at > now() then return false; end if;
  if r.status='processing' and r.processing_started_at is not null and r.processing_started_at > now()-interval '15 minutes' then return false; end if;
  if r.status not in ('verified','failed','processing') then raise exception 'webhook receipt is not claimable from status %', r.status; end if;
  update public.runlu_webhook_receipts
  set status='processing',processing_attempt_count=processing_attempt_count+1,processing_started_at=now(),failure_code=null,next_retry_at=null
  where id=r.id;
  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_complete_webhook_receipt(p_receipt_id uuid, p_commerce_event_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  r public.runlu_webhook_receipts%rowtype;
  e public.runlu_commerce_events%rowtype;
begin
  select * into r
  from public.runlu_webhook_receipts
  where id = p_receipt_id
  for update;

  if not found then
    raise exception 'webhook receipt not found';
  end if;

  if r.status = 'processed' then
    if p_commerce_event_id is not null and r.commerce_event_id is distinct from p_commerce_event_id then
      raise exception 'webhook receipt already processed with a different commerce event';
    end if;
    return true;
  end if;

  if r.status <> 'processing' or r.signature_verified is not true then
    raise exception 'webhook receipt must be verified and processing before completion';
  end if;

  if p_commerce_event_id is not null then
    select * into e
    from public.runlu_commerce_events
    where id = p_commerce_event_id;

    if not found then
      raise exception 'commerce event not found';
    end if;

    if lower(e.source) <> r.provider or e.provider_event_id is distinct from r.provider_event_id then
      raise exception 'commerce event does not match webhook provider/event id';
    end if;
  end if;

  update public.runlu_webhook_receipts
  set status = 'processed',
      processed_at = now(),
      processing_started_at = null,
      failure_code = null,
      commerce_event_id = coalesce(p_commerce_event_id, commerce_event_id)
  where id = r.id;

  return true;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_complete_webhook_receipt(p_receipt_id uuid, p_commerce_event_id uuid DEFAULT NULL::uuid, p_processing_disposition text DEFAULT NULL::text, p_disposition_note text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r public.runlu_webhook_receipts%rowtype; e public.runlu_commerce_events%rowtype;
v_disp text:=coalesce(nullif(btrim(p_processing_disposition),''),case when p_commerce_event_id is not null then 'fulfilled' else 'acknowledged_noop' end);
begin
 select * into r from public.runlu_webhook_receipts where id=p_receipt_id for update;
 if not found then raise exception 'webhook receipt not found'; end if;
 if v_disp not in('fulfilled','acknowledged_noop','awaiting_correlation','unsupported') then raise exception 'invalid processing disposition'; end if;
 if v_disp='fulfilled' and p_commerce_event_id is null then raise exception 'fulfilled receipt requires commerce event'; end if;
 if p_commerce_event_id is not null then
   select * into e from public.runlu_commerce_events where id=p_commerce_event_id;
   if not found then raise exception 'commerce event not found'; end if;
   if lower(e.source)<>r.provider or e.provider_event_id is distinct from r.provider_event_id then raise exception 'commerce event does not match webhook provider/event id'; end if;
 end if;
 if r.status='processed' then
   if p_commerce_event_id is not null and r.commerce_event_id is distinct from p_commerce_event_id then raise exception 'webhook receipt already processed with a different commerce event'; end if;
   update public.runlu_webhook_receipts set processing_disposition=coalesce(processing_disposition,v_disp),
     disposition_note=coalesce(disposition_note,nullif(btrim(p_disposition_note),'')) where id=r.id;
   return true;
 end if;
 if r.status<>'processing' or r.signature_verified is not true then raise exception 'webhook receipt must be verified and processing before completion'; end if;
 update public.runlu_webhook_receipts set status='processed',processed_at=now(),processing_started_at=null,failure_code=null,
 commerce_event_id=coalesce(p_commerce_event_id,commerce_event_id),processing_disposition=v_disp,
 disposition_note=nullif(btrim(p_disposition_note),'') where id=r.id;
 return true;
end;$function$;

CREATE OR REPLACE FUNCTION public.runlu_normalize_webhook_event(p_webhook_receipt_id uuid, p_canonical_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_order_id uuid DEFAULT NULL::uuid, p_subscription_id uuid DEFAULT NULL::uuid, p_product_key text DEFAULT NULL::text, p_plan_key text DEFAULT NULL::text, p_provider_occurred_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_provider_sequence bigint DEFAULT NULL::bigint)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  r public.runlu_webhook_receipts%rowtype;
  spec public.runlu_commerce_event_types%rowtype;
  o public.runlu_orders%rowtype;
  s public.runlu_subscriptions%rowtype;
  e public.runlu_commerce_events%rowtype;
  v_user uuid:=p_user_id;
  v_product text:=nullif(btrim(p_product_key),'');
  v_plan text:=nullif(btrim(p_plan_key),'');
  v_event_type text:=nullif(btrim(p_canonical_event_type),'');
  v_event_id uuid;
begin
  if p_webhook_receipt_id is null or v_event_type is null then
    raise exception 'webhook receipt and canonical event type are required';
  end if;
  if p_provider_sequence is not null and p_provider_sequence<0 then
    raise exception 'provider sequence cannot be negative';
  end if;

  select * into r from public.runlu_webhook_receipts where id=p_webhook_receipt_id for update;
  if not found then raise exception 'Webhook receipt not found'; end if;
  if r.signature_verified is not true then raise exception 'Webhook signature is not verified'; end if;

  select * into spec from public.runlu_commerce_event_types where event_type=v_event_type and enabled is true;
  if not found then raise exception 'Unsupported canonical commerce event type: %',v_event_type; end if;

  if not public.runlu_provider_capability_ready(r.provider,'normalize_event') then
    raise exception 'Provider normalization adapter is not ready';
  end if;

  if r.commerce_event_id is not null then
    select * into e from public.runlu_commerce_events where id=r.commerce_event_id;
    if not found then raise exception 'Webhook receipt links to missing commerce event'; end if;
    if e.source<>r.provider or e.provider_event_id<>r.provider_event_id or e.event_type<>v_event_type then
      raise exception 'Existing normalization linkage does not match receipt/event contract';
    end if;
    return e.id;
  end if;

  if r.status<>'processing' then
    raise exception 'Webhook receipt must be claimed for processing before normalization';
  end if;
  if p_provider_occurred_at is null and p_provider_sequence is null then
    raise exception 'External normalized event requires provider timestamp or sequence';
  end if;

  if p_order_id is not null and p_subscription_id is not null then
    raise exception 'Normalized event cannot target both order and subscription';
  end if;
  if p_order_id is null and p_subscription_id is null then
    raise exception 'Normalized event requires an order or subscription target';
  end if;

  if p_order_id is not null then
    if spec.target_scope not in ('order','either') then raise exception 'Canonical event type requires subscription target'; end if;
    select * into o from public.runlu_orders where id=p_order_id;
    if not found then raise exception 'Order not found'; end if;
    if o.payment_provider is not null and o.payment_provider<>r.provider then raise exception 'Order payment provider does not match webhook provider'; end if;
    if v_user is null then v_user:=o.user_id; elsif v_user<>o.user_id then raise exception 'Order user mismatch'; end if;
  else
    if spec.target_scope not in ('subscription','either') then raise exception 'Canonical event type requires order target'; end if;
    select * into s from public.runlu_subscriptions where id=p_subscription_id;
    if not found then raise exception 'Subscription not found'; end if;
    if s.payment_provider is not null and s.payment_provider<>r.provider then raise exception 'Subscription payment provider does not match webhook provider'; end if;
    if v_user is null then v_user:=s.user_id; elsif v_user<>s.user_id then raise exception 'Subscription user mismatch'; end if;
    if v_product is null then v_product:=s.product_key; elsif v_product<>s.product_key then raise exception 'Subscription product mismatch'; end if;
    if v_plan is null then v_plan:=s.plan_key; elsif v_plan<>s.plan_key then raise exception 'Subscription plan mismatch'; end if;
  end if;

  if spec.requires_user and v_user is null then raise exception 'Canonical event requires user'; end if;
  if spec.requires_product and v_product is null then raise exception 'Canonical event requires product'; end if;
  if spec.requires_plan and v_plan is null then raise exception 'Canonical event requires plan'; end if;

  if not exists(select 1 from public.runlu_product_plans p where p.plan_key=v_plan and p.product_key=v_product) then
    raise exception 'Plan/product contract mismatch';
  end if;

  if p_order_id is not null and not exists(
    select 1 from public.runlu_order_items oi
    where oi.order_id=p_order_id and oi.product_key=v_product and oi.plan_key=v_plan
  ) then raise exception 'Order does not contain normalized product/plan'; end if;

  select * into e from public.runlu_commerce_events
   where source=r.provider and provider_event_id=r.provider_event_id;
  if found then
    if e.event_type<>v_event_type
       or e.user_id is distinct from v_user
       or e.order_id is distinct from p_order_id
       or e.subscription_id is distinct from p_subscription_id
       or e.product_key is distinct from v_product
       or e.plan_key is distinct from v_plan then
      raise exception 'Provider event id already normalized with different canonical facts';
    end if;
    update public.runlu_webhook_receipts set commerce_event_id=e.id where id=r.id;
    return e.id;
  end if;

  insert into public.runlu_commerce_events(
    user_id,event_type,order_id,subscription_id,product_key,plan_key,source,event_status,
    provider_event_id,provider_occurred_at,provider_sequence,ordering_status,
    webhook_receipt_id,provider_event_type,normalization_version,metadata
  ) values(
    v_user,v_event_type,p_order_id,p_subscription_id,v_product,v_plan,r.provider,'recorded',
    r.provider_event_id,p_provider_occurred_at,p_provider_sequence,'unassessed',
    r.id,r.event_type,'v2','{}'::jsonb
  ) returning id into v_event_id;

  update public.runlu_webhook_receipts set commerce_event_id=v_event_id where id=r.id;
  return v_event_id;
end;$function$;

CREATE OR REPLACE FUNCTION public.runlu_orchestrate_fulfillment(p_event_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  ev public.runlu_commerce_events%rowtype;
  p public.runlu_product_plans%rowtype;
  v_run_id uuid;
  v_entitlement_id uuid;
  v_units integer;
  v_action text;
begin
  select id into v_run_id from public.runlu_fulfillment_runs where commerce_event_id=p_event_id;
  if found then return v_run_id; end if;

  select * into ev from public.runlu_commerce_events where id=p_event_id for update;
  if not found then raise exception 'Commerce event not found'; end if;
  if ev.plan_key is null or ev.product_key is null then raise exception 'Fulfillment requires product and plan'; end if;
  select * into p from public.runlu_product_plans where plan_key=ev.plan_key and product_key=ev.product_key;
  if not found then raise exception 'Fulfillment plan/product mismatch'; end if;
  if p.fulfillment_mode not in ('product_access','consumable_credit') then raise exception 'Plan fulfillment mode is not orchestratable: %',p.fulfillment_mode; end if;

  if ev.event_type in ('payment_succeeded','order_paid','subscription_activated','subscription_renewed') then
    v_action:='grant';
    if p.fulfillment_mode='product_access' then
      v_entitlement_id:=public.runlu_process_entitlement_event(ev.id);
      if v_entitlement_id is null then return null; end if;
    else
      if ev.event_type not in ('payment_succeeded','order_paid') then raise exception 'Consumable credit cannot be fulfilled from subscription event'; end if;
      v_units:=public.runlu_process_consumable_event(ev.id);
      if v_units<=0 then return null; end if;
    end if;
  elsif ev.event_type in ('payment.refunded','order.refunded','order.cancelled','subscription.cancelled','subscription.expired','subscription.past_due') then
    v_action:='revoke';
    if p.fulfillment_mode='product_access' then
      perform public.runlu_process_entitlement_revocation(ev.id);
      select id into v_entitlement_id from public.runlu_entitlements where user_id=ev.user_id and product_key=ev.product_key;
    else
      if ev.event_type not in ('payment.refunded','order.refunded','order.cancelled') then raise exception 'Consumable credit revocation requires an order event'; end if;
      v_units:=public.runlu_process_consumable_revocation(ev.id);
    end if;
  else
    raise exception 'Commerce event type is not fulfillable: %',ev.event_type;
  end if;

  insert into public.runlu_fulfillment_runs(commerce_event_id,fulfillment_mode,action,entitlement_id,units)
  values(ev.id,p.fulfillment_mode,v_action,v_entitlement_id,v_units)
  on conflict(commerce_event_id) do update set commerce_event_id=excluded.commerce_event_id
  returning id into v_run_id;
  return v_run_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_process_consumable_event(p_event_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  ev public.runlu_commerce_events%rowtype;
  p public.runlu_product_plans%rowtype;
  oi public.runlu_order_items%rowtype;
  v_total integer := 0;
begin
  select * into ev from public.runlu_commerce_events where id = p_event_id for update;
  if not found then raise exception 'Commerce event not found'; end if;

  if ev.event_status = 'processed' then
    select coalesce(sum(units_granted),0)::integer into v_total
    from public.runlu_consumable_credits where commerce_event_id = ev.id;
    return v_total;
  end if;
  if ev.event_status <> 'recorded' then raise exception 'Commerce event is not processable: %', ev.event_status; end if;
  if ev.order_id is null or ev.user_id is null or ev.product_key is null or ev.plan_key is null then
    raise exception 'Consumable event requires order, user, product and plan';
  end if;
  if ev.event_type not in ('payment_succeeded','order_paid') then
    raise exception 'Event type is not eligible for consumable credit: %', ev.event_type;
  end if;

  perform public.runlu_validate_commerce_event_state(ev.id);
  perform public.runlu_assess_commerce_event_ordering(ev.id);
  select * into ev from public.runlu_commerce_events where id = p_event_id;
  if ev.ordering_status in ('stale','missing_clock') then
    update public.runlu_commerce_events set event_status='ignored' where id=ev.id;
    return 0;
  end if;

  select * into p from public.runlu_product_plans where plan_key=ev.plan_key;
  if not found or p.product_key <> ev.product_key or p.fulfillment_mode <> 'consumable_credit' then
    raise exception 'Plan is not consumable credit';
  end if;

  for oi in
    select * from public.runlu_order_items
    where order_id=ev.order_id and product_key=ev.product_key and plan_key=ev.plan_key
    order by created_at,id
  loop
    insert into public.runlu_consumable_credits(
      commerce_event_id,order_id,order_item_id,user_id,product_key,plan_key,units_granted
    ) values (
      ev.id,ev.order_id,oi.id,ev.user_id,ev.product_key,ev.plan_key,oi.quantity
    ) on conflict (commerce_event_id,order_item_id) do nothing;
  end loop;

  select coalesce(sum(units_granted),0)::integer into v_total
  from public.runlu_consumable_credits where commerce_event_id=ev.id;
  if v_total <= 0 then raise exception 'No matching consumable order item found'; end if;

  update public.runlu_commerce_events set event_status='processed' where id=ev.id;
  return v_total;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_process_consumable_revocation(p_event_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare ev public.runlu_commerce_events%rowtype; p public.runlu_product_plans%rowtype; v_units integer:=0; v_existing integer;
begin
  select * into ev from public.runlu_commerce_events where id=p_event_id for update;
  if not found then raise exception 'Commerce event not found'; end if;
  select units_revoked into v_existing from public.runlu_consumable_revocations where commerce_event_id=ev.id;
  if found then return v_existing; end if;
  if ev.event_status<>'recorded' then raise exception 'Commerce event is not processable: %',ev.event_status; end if;
  if ev.event_type not in ('payment.refunded','order.refunded','order.cancelled') then raise exception 'Event type is not eligible for consumable revocation'; end if;
  if ev.order_id is null or ev.user_id is null or ev.product_key is null or ev.plan_key is null then raise exception 'Consumable revocation requires order,user,product,plan'; end if;
  perform public.runlu_validate_commerce_event_state(ev.id);
  perform public.runlu_assess_commerce_event_ordering(ev.id);
  select * into ev from public.runlu_commerce_events where id=p_event_id;
  if ev.ordering_status in ('stale','missing_clock') then update public.runlu_commerce_events set event_status='ignored' where id=ev.id; return 0; end if;
  select * into p from public.runlu_product_plans where plan_key=ev.plan_key;
  if not found or p.product_key<>ev.product_key or p.fulfillment_mode<>'consumable_credit' then raise exception 'Plan is not consumable credit'; end if;
  select coalesce(sum(units_granted-units_consumed),0)::integer into v_units
    from public.runlu_consumable_credits where order_id=ev.order_id and user_id=ev.user_id and product_key=ev.product_key and plan_key=ev.plan_key and status='active';
  update public.runlu_consumable_credits set status='revoked',updated_at=now()
    where order_id=ev.order_id and user_id=ev.user_id and product_key=ev.product_key and plan_key=ev.plan_key and status='active';
  insert into public.runlu_consumable_revocations(commerce_event_id,user_id,product_key,plan_key,units_revoked,reason)
    values(ev.id,ev.user_id,ev.product_key,ev.plan_key,v_units,case when ev.event_type='order.cancelled' then 'order_cancelled' else 'refund' end);
  update public.runlu_commerce_events set event_status='processed' where id=ev.id;
  return v_units;
end;$function$;

CREATE OR REPLACE FUNCTION public.runlu_process_entitlement_event(p_event_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  ev public.runlu_commerce_events%rowtype;
  cat public.runlu_product_catalog%rowtype;
  sub public.runlu_subscriptions%rowtype;
  p public.runlu_product_plans%rowtype;
  v_ends_at timestamptz;
  v_starts_at timestamptz;
  v_grant_type text;
  v_basis_type text;
  v_basis_key text;
  v_basis_id uuid;
  v_entitlement_id uuid;
begin
  select * into ev from public.runlu_commerce_events where id=p_event_id for update;
  if not found then raise exception 'Commerce event not found'; end if;
  if ev.event_status='processed' then
    select entitlement_id into v_entitlement_id from public.runlu_entitlement_grants where commerce_event_id=ev.id;
    return v_entitlement_id;
  end if;
  if ev.event_status<>'recorded' then raise exception 'Commerce event is not processable: %',ev.event_status; end if;
  if ev.event_type not in ('payment_succeeded','order_paid','subscription_activated','subscription_renewed') then raise exception 'Commerce event type is not eligible for entitlement grant: %',ev.event_type; end if;
  if ev.user_id is null or ev.product_key is null or ev.plan_key is null then raise exception 'Commerce event must include user, product and plan'; end if;

  select * into p from public.runlu_product_plans where plan_key=ev.plan_key;
  if not found or p.product_key<>ev.product_key then raise exception 'Plan/product contract mismatch'; end if;
  if p.fulfillment_mode<>'product_access' then raise exception 'Plan fulfillment mode % cannot create product entitlement',p.fulfillment_mode; end if;

  if p.plan_type='subscription' and ev.subscription_id is null then
    raise exception 'Subscription plan entitlement requires a correlated subscription lifecycle event';
  end if;

  perform public.runlu_validate_commerce_event_state(ev.id);
  perform public.runlu_assess_commerce_event_ordering(ev.id);
  select * into ev from public.runlu_commerce_events where id=p_event_id;
  if ev.ordering_status in ('stale','missing_clock') then update public.runlu_commerce_events set event_status='ignored' where id=ev.id; return null; end if;

  select * into cat from public.runlu_product_catalog where product_key=ev.product_key;
  if not found or cat.status<>'active' or cat.library_eligible is not true then raise exception 'Product is not eligible for entitlement grant'; end if;

  v_starts_at:=coalesce(ev.provider_occurred_at,now());
  if ev.subscription_id is not null then
    select * into sub from public.runlu_subscriptions where id=ev.subscription_id and user_id=ev.user_id and product_key=ev.product_key and plan_key=ev.plan_key;
    if not found then raise exception 'Matching subscription not found'; end if;
    v_ends_at:=sub.current_period_end;
    if v_ends_at is null or v_ends_at<=v_starts_at then raise exception 'Subscription entitlement requires a valid future period end'; end if;
    v_grant_type:='subscription'; v_basis_type:='subscription';
    v_basis_key:='subscription:'||ev.subscription_id::text||':'||ev.plan_key;
  else
    if ev.order_id is null then raise exception 'Non-subscription entitlement grant requires an order_id'; end if;
    if not exists(select 1 from public.runlu_orders o join public.runlu_order_items oi on oi.order_id=o.id where o.id=ev.order_id and o.user_id=ev.user_id and o.status='paid' and oi.product_key=ev.product_key and oi.plan_key=ev.plan_key) then raise exception 'Matching paid order item not found'; end if;
    v_ends_at:=null; v_grant_type:='one_time'; v_basis_type:='commerce_order';
    v_basis_key:='order:'||ev.order_id::text||':'||ev.plan_key;
  end if;

  insert into public.runlu_entitlement_bases(user_id,product_key,basis_type,basis_key,status,starts_at,ends_at,order_id,subscription_id,grant_event_id)
  values(ev.user_id,ev.product_key,v_basis_type,v_basis_key,'active',v_starts_at,v_ends_at,ev.order_id,ev.subscription_id,ev.id)
  on conflict(user_id,product_key,basis_key) do update
    set status='active',starts_at=least(public.runlu_entitlement_bases.starts_at,excluded.starts_at),
        ends_at=case when public.runlu_entitlement_bases.basis_type='subscription' then excluded.ends_at else null end,
        order_id=coalesce(public.runlu_entitlement_bases.order_id,excluded.order_id),
        subscription_id=coalesce(public.runlu_entitlement_bases.subscription_id,excluded.subscription_id),
        grant_event_id=excluded.grant_event_id,revocation_event_id=null,updated_at=now()
  returning id into v_basis_id;

  v_entitlement_id:=public.runlu_recompute_effective_entitlement(ev.user_id,ev.product_key);
  insert into public.runlu_entitlement_grants(commerce_event_id,entitlement_id,user_id,product_key,grant_type,starts_at,ends_at,basis_id)
  values(ev.id,v_entitlement_id,ev.user_id,ev.product_key,v_grant_type,v_starts_at,v_ends_at,v_basis_id)
  on conflict(commerce_event_id) do update set basis_id=excluded.basis_id, entitlement_id=excluded.entitlement_id;
  update public.runlu_commerce_events set event_status='processed' where id=ev.id;
  return v_entitlement_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_process_entitlement_revocation(p_event_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  ev public.runlu_commerce_events%rowtype;
  p public.runlu_product_plans%rowtype;
  b public.runlu_entitlement_bases%rowtype;
  v_entitlement_id uuid;
  v_reason text;
  v_effective_end timestamptz;
  v_revocation_id uuid;
  v_basis_key text;
begin
  select * into ev from public.runlu_commerce_events where id=p_event_id for update;
  if not found then raise exception 'Commerce event not found'; end if;
  select id into v_revocation_id from public.runlu_entitlement_revocations where commerce_event_id=ev.id;
  if found then return v_revocation_id; end if;
  if ev.event_status='ignored' and ev.ordering_status='stale' then return null; end if;
  if ev.event_status<>'recorded' then raise exception 'Commerce event is not processable: %',ev.event_status; end if;
  if ev.user_id is null or ev.product_key is null or ev.plan_key is null then raise exception 'Revocation event requires user, product and plan'; end if;

  select * into p from public.runlu_product_plans where plan_key=ev.plan_key;
  if not found or p.product_key<>ev.product_key or p.fulfillment_mode<>'product_access' then raise exception 'Revocation plan is not product access'; end if;

  if not public.runlu_apply_commerce_event_order_guard(ev.id) then return null; end if;
  perform public.runlu_validate_commerce_event_state(ev.id);

  if ev.event_type in ('payment.refunded','order.refunded','order.cancelled') then
    if ev.order_id is null then raise exception 'Order revocation requires order_id'; end if;
    v_reason:=case when ev.event_type='order.cancelled' then 'order_cancelled' else 'refund' end;
    v_basis_key:='order:'||ev.order_id::text||':'||ev.plan_key;
  elsif ev.event_type in ('subscription.cancelled','subscription.expired','subscription.past_due') then
    if ev.subscription_id is null then raise exception 'Subscription revocation requires subscription_id'; end if;
    v_reason:=case ev.event_type when 'subscription.cancelled' then 'subscription_cancelled' when 'subscription.expired' then 'subscription_expired' else 'subscription_past_due' end;
    v_basis_key:='subscription:'||ev.subscription_id::text||':'||ev.plan_key;
  else raise exception 'Unsupported revocation event type: %',ev.event_type;
  end if;

  select * into b from public.runlu_entitlement_bases
   where user_id=ev.user_id and product_key=ev.product_key and basis_key=v_basis_key for update;
  if not found then raise exception 'Matching commerce entitlement basis not found'; end if;

  select id into v_entitlement_id from public.runlu_entitlements where user_id=ev.user_id and product_key=ev.product_key for update;
  if not found then raise exception 'Effective entitlement projection not found'; end if;

  if ev.event_type='subscription.cancelled' then
    select current_period_end into v_effective_end from public.runlu_subscriptions where id=ev.subscription_id;
    if v_effective_end is not null and v_effective_end>now() and v_effective_end>b.starts_at then
      update public.runlu_entitlement_bases set status='active',ends_at=v_effective_end,revocation_event_id=ev.id,updated_at=now() where id=b.id;
    else
      update public.runlu_entitlement_bases set status='revoked',ends_at=case when now()>starts_at then now() else starts_at+interval '1 second' end,revocation_event_id=ev.id,updated_at=now() where id=b.id;
    end if;
  elsif ev.event_type='subscription.expired' then
    update public.runlu_entitlement_bases set status='expired',ends_at=case when ends_at is not null and ends_at>starts_at then least(ends_at,now()) else greatest(starts_at+interval '1 second',now()) end,revocation_event_id=ev.id,updated_at=now() where id=b.id;
  else
    update public.runlu_entitlement_bases set status='revoked',ends_at=case when ends_at is not null and ends_at>starts_at then least(ends_at,now()) else greatest(starts_at+interval '1 second',now()) end,revocation_event_id=ev.id,updated_at=now() where id=b.id;
  end if;

  perform public.runlu_recompute_effective_entitlement(ev.user_id,ev.product_key);

  insert into public.runlu_entitlement_revocations(commerce_event_id,entitlement_id,user_id,product_key,reason,previous_ends_at,basis_id)
  values(ev.id,v_entitlement_id,ev.user_id,ev.product_key,v_reason,b.ends_at,b.id)
  returning id into v_revocation_id;

  update public.runlu_commerce_events set event_status='processed' where id=ev.id;
  return v_revocation_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_provider_capability_ready(p_provider text, p_operation text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare a public.runlu_provider_adapters%rowtype;
begin
  select * into a from public.runlu_provider_adapters where provider_name=p_provider;
  if not found or a.implementation_status<>'ready' then return false; end if;
  return case p_operation
    when 'create_checkout' then a.create_checkout_ready
    when 'verify_webhook' then a.verify_webhook_ready
    when 'normalize_event' then a.normalize_event_ready
    when 'refund' then a.refund_ready
    when 'subscription_sync' then a.subscription_sync_ready
    else false end;
end;$function$;

CREATE OR REPLACE FUNCTION public.runlu_recompute_effective_entitlement(p_user_id uuid, p_product_key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_entitlement_id uuid;
  v_source text;
  v_starts timestamptz;
  v_ends timestamptz;
  v_has_permanent boolean;
  v_active_count integer;
  v_terminal_status text;
begin
  if p_user_id is null or nullif(btrim(p_product_key),'') is null then
    raise exception 'user and product are required';
  end if;

  select count(*)::integer,min(starts_at),bool_or(ends_at is null),max(ends_at)
    into v_active_count,v_starts,v_has_permanent,v_ends
  from public.runlu_entitlement_bases
  where user_id=p_user_id and product_key=p_product_key and status='active'
    and starts_at<=now() and (ends_at is null or ends_at>now());

  if v_active_count>0 then
    select case basis_type
             when 'owner_seed' then 'owner_seed'
             when 'manual' then 'manual'
             when 'subscription' then 'commerce'
             when 'commerce_order' then 'commerce'
             when 'legacy_commerce' then 'commerce'
             when 'free_plan' then 'free_plan'
             else 'manual'
           end
      into v_source
    from public.runlu_entitlement_bases
    where user_id=p_user_id and product_key=p_product_key and status='active'
      and starts_at<=now() and (ends_at is null or ends_at>now())
    order by case basis_type
               when 'owner_seed' then 1
               when 'manual' then 2
               when 'subscription' then 3
               when 'commerce_order' then 4
               when 'legacy_commerce' then 5
               when 'free_plan' then 6
               else 7
             end,
             starts_at,id
    limit 1;

    if v_has_permanent then v_ends:=null; end if;

    insert into public.runlu_entitlements(user_id,product_key,source,status,starts_at,ends_at)
    values(p_user_id,p_product_key,v_source,'active',v_starts,v_ends)
    on conflict(user_id,product_key) do update
      set source=excluded.source,status='active',starts_at=excluded.starts_at,
          ends_at=excluded.ends_at,updated_at=now()
    returning id into v_entitlement_id;
    return v_entitlement_id;
  end if;

  select id into v_entitlement_id
  from public.runlu_entitlements
  where user_id=p_user_id and product_key=p_product_key
  for update;
  if not found then return null; end if;

  select case when bool_or(status='revoked') then 'revoked' else 'expired' end
    into v_terminal_status
  from public.runlu_entitlement_bases
  where user_id=p_user_id and product_key=p_product_key;
  v_terminal_status:=coalesce(v_terminal_status,'revoked');

  update public.runlu_entitlements
     set status=v_terminal_status,
         ends_at=case when ends_at is not null and ends_at>starts_at then least(ends_at,now())
                      else greatest(starts_at+interval '1 second',now()) end,
         updated_at=now()
   where id=v_entitlement_id;
  return v_entitlement_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_record_webhook_receipt(p_provider text, p_provider_event_id text, p_event_type text, p_payload_sha256 text DEFAULT NULL::text, p_signature_verified boolean DEFAULT false, p_failure_code text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_id uuid;
  v_provider text := lower(btrim(p_provider));
  v_provider_event_id text := btrim(p_provider_event_id);
  v_event_type text := btrim(p_event_type);
  v_hash text := case when p_payload_sha256 is null then null else lower(btrim(p_payload_sha256)) end;
  v_existing public.runlu_webhook_receipts%rowtype;
  v_mismatch boolean := false;
  v_mismatch_code text;
begin
  if nullif(v_provider, '') is null
     or nullif(v_provider_event_id, '') is null
     or nullif(v_event_type, '') is null then
    raise exception 'provider, provider_event_id and event_type are required';
  end if;

  if v_hash is not null and v_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'payload_sha256 must be a 64-character hexadecimal SHA-256 digest';
  end if;

  select * into v_existing
  from public.runlu_webhook_receipts
  where provider = v_provider
    and provider_event_id = v_provider_event_id
  for update;

  if not found then
    insert into public.runlu_webhook_receipts(
      provider, provider_event_id, event_type, payload_sha256,
      signature_verified, status, failure_code
    ) values (
      v_provider, v_provider_event_id, v_event_type, v_hash,
      p_signature_verified,
      case when p_signature_verified then 'verified' else 'rejected' end,
      case when p_signature_verified then null else coalesce(nullif(btrim(p_failure_code), ''), 'signature_not_verified') end
    ) returning id into v_id;
    return v_id;
  end if;

  if v_existing.event_type <> v_event_type then
    v_mismatch := true;
    v_mismatch_code := 'duplicate_event_type_mismatch';
  elsif v_existing.payload_sha256 is not null and v_hash is not null and v_existing.payload_sha256 <> v_hash then
    v_mismatch := true;
    v_mismatch_code := 'duplicate_payload_mismatch';
  end if;

  if v_mismatch then
    update public.runlu_webhook_receipts
    set last_received_at = now(),
        delivery_count = delivery_count + 1,
        duplicate_mismatch_count = duplicate_mismatch_count + 1,
        failure_code = v_mismatch_code,
        status = case when status in ('processed','processing') then status else 'rejected' end
    where id = v_existing.id;
    return v_existing.id;
  end if;

  update public.runlu_webhook_receipts
  set last_received_at = now(),
      delivery_count = delivery_count + 1,
      payload_sha256 = coalesce(payload_sha256, v_hash),
      signature_verified = signature_verified or p_signature_verified,
      status = case
        when status in ('processed','processing') then status
        when signature_verified or p_signature_verified then 'verified'
        else 'rejected'
      end,
      failure_code = case
        when status in ('processed','processing') then failure_code
        when signature_verified or p_signature_verified then null
        else coalesce(nullif(btrim(p_failure_code), ''), failure_code, 'signature_not_verified')
      end
  where id = v_existing.id
  returning id into v_id;

  return v_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_validate_commerce_event_state(p_event_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  ev public.runlu_commerce_events%rowtype;
  o public.runlu_orders%rowtype;
  s public.runlu_subscriptions%rowtype;
begin
  select * into ev
  from public.runlu_commerce_events
  where id = p_event_id;

  if not found then
    raise exception 'Commerce event not found';
  end if;

  if ev.order_id is not null then
    select * into o from public.runlu_orders where id = ev.order_id;
    if not found then raise exception 'Order not found'; end if;
    if ev.user_id is not null and o.user_id <> ev.user_id then raise exception 'Order user mismatch'; end if;
  end if;

  if ev.subscription_id is not null then
    select * into s from public.runlu_subscriptions where id = ev.subscription_id;
    if not found then raise exception 'Subscription not found'; end if;
    if ev.user_id is not null and s.user_id <> ev.user_id then raise exception 'Subscription user mismatch'; end if;
    if ev.product_key is not null and s.product_key <> ev.product_key then raise exception 'Subscription product mismatch'; end if;
    if ev.plan_key is not null and s.plan_key <> ev.plan_key then raise exception 'Subscription plan mismatch'; end if;
  end if;

  if ev.event_type = 'order_paid' then
    if ev.order_id is null or o.status <> 'paid' then raise exception 'order_paid requires a paid order'; end if;
  elsif ev.event_type = 'payment_succeeded' then
    if ev.order_id is not null and o.status <> 'paid' then raise exception 'payment_succeeded order must be paid'; end if;
    if ev.subscription_id is not null and s.status <> 'active' then raise exception 'payment_succeeded subscription must be active'; end if;
    if ev.order_id is null and ev.subscription_id is null then raise exception 'payment_succeeded requires order_id or subscription_id'; end if;
  elsif ev.event_type in ('subscription_activated','subscription_renewed') then
    if ev.subscription_id is null or s.status <> 'active' then raise exception '% requires active subscription', ev.event_type; end if;
    if s.current_period_start is null or s.current_period_end is null or s.current_period_end <= now() then
      raise exception '% requires a current valid subscription period', ev.event_type;
    end if;
  elsif ev.event_type in ('payment.refunded','order.refunded') then
    if ev.order_id is null or o.status <> 'refunded' then raise exception '% requires refunded order', ev.event_type; end if;
  elsif ev.event_type = 'order.cancelled' then
    if ev.order_id is null or o.status <> 'cancelled' then raise exception 'order.cancelled requires cancelled order'; end if;
  elsif ev.event_type = 'subscription.cancelled' then
    if ev.subscription_id is null or s.status <> 'cancelled' then raise exception 'subscription.cancelled requires cancelled subscription'; end if;
  elsif ev.event_type = 'subscription.expired' then
    if ev.subscription_id is null or s.status <> 'expired' then raise exception 'subscription.expired requires expired subscription'; end if;
  elsif ev.event_type = 'subscription.past_due' then
    if ev.subscription_id is null or s.status <> 'past_due' then raise exception 'subscription.past_due requires past_due subscription'; end if;
  end if;
end;
$function$;
