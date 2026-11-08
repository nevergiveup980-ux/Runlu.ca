-- Read-only trigger function snapshot, 2026-11-08. Isolated tests only.
CREATE OR REPLACE FUNCTION public.runlu_record_subscription_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if new.status is distinct from old.status then
    insert into public.runlu_subscription_status_history(subscription_id, user_id, from_status, to_status)
    values (new.id, new.user_id, old.status, new.status);
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_validate_entitlement_product()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_status text;
  v_library_eligible boolean;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select status, library_eligible
    into v_status, v_library_eligible
  from public.runlu_product_catalog
  where product_key = new.product_key;

  if v_status is null then
    raise exception 'Unknown RUNLU product key: %', new.product_key;
  end if;

  if v_status <> 'active' then
    raise exception 'RUNLU product % is not active', new.product_key;
  end if;

  if not v_library_eligible then
    raise exception 'RUNLU product % is not eligible for My Library', new.product_key;
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_validate_plan_product_pair()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_product_key text;
begin
  if new.plan_key is null then
    return new;
  end if;

  select p.product_key into v_product_key
  from public.runlu_product_plans p
  where p.plan_key = new.plan_key;

  if v_product_key is null then
    raise exception 'Unknown RUNLU plan';
  end if;

  if new.product_key is null or new.product_key <> v_product_key then
    raise exception 'RUNLU plan/product mismatch';
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_validate_subscription_period_integrity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if new.status in ('active','paused','past_due') then
    if new.current_period_start is null or new.current_period_end is null then
      raise exception 'Subscription status % requires a complete current period',new.status;
    end if;
    if new.current_period_end<=new.current_period_start then
      raise exception 'Subscription current period end must be after start';
    end if;
  end if;

  if new.status='cancelled' and new.cancel_at_period_end then
    if new.current_period_start is null or new.current_period_end is null then
      raise exception 'End-of-period cancellation requires a complete current period';
    end if;
    if new.current_period_end<=new.current_period_start then
      raise exception 'Subscription current period end must be after start';
    end if;
    if new.current_period_end<=now() then
      raise exception 'End-of-period cancellation requires a future current_period_end';
    end if;
  elsif new.cancel_at_period_end then
    if new.status not in ('active','paused','past_due') then
      raise exception 'cancel_at_period_end is only valid for a live or paid-through cancelled subscription';
    end if;
    if new.current_period_end is null then
      raise exception 'cancel_at_period_end requires current_period_end';
    end if;
  end if;

  if new.status='expired' and new.current_period_end is not null and new.current_period_end>now() then
    raise exception 'Expired subscription cannot have a future current_period_end';
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.runlu_validate_subscription_status_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status = 'pending' and new.status in ('active','cancelled','expired') then
    return new;
  elsif old.status = 'active' and new.status in ('past_due','paused','cancelled','expired') then
    return new;
  elsif old.status = 'past_due' and new.status in ('active','paused','cancelled','expired') then
    return new;
  elsif old.status = 'paused' and new.status in ('active','cancelled','expired') then
    return new;
  elsif old.status = 'cancelled' and new.status = 'expired' then
    return new;
  elsif old.status = 'expired' then
    raise exception 'Expired subscription is terminal and cannot transition to %', new.status;
  else
    raise exception 'Invalid subscription status transition: % -> %', old.status, new.status;
  end if;
end;
$function$;
