-- Reviewed, manual rollout in a NON-PRODUCTION Forum environment first.
-- Existing public.forum_ai_usage remains the legacy spending ledger.
begin;
create schema if not exists forum_ai_private;
revoke all on schema forum_ai_private from public, anon, authenticated;
create table if not exists forum_ai_private.batches (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default clock_timestamp(),
 client_hash text not null,
 calls integer not null check (calls between 1 and 6),
 reserved_usd numeric not null check (reserved_usd = calls * 0.05),
 lease_until timestamptz not null default clock_timestamp() + interval '10 minutes',
 finished boolean not null default false
);
create table if not exists forum_ai_private.health (
 provider text primary key check (provider in ('OpenAI','Claude','Gemini')),
 verified_at timestamptz,
 key_fingerprint text,
 last_usage jsonb,
 last_cost numeric
);
alter table forum_ai_private.batches enable row level security;
alter table forum_ai_private.health enable row level security;
revoke all on all tables in schema forum_ai_private from public, anon, authenticated;

create or replace function public.forum_ai_reserve_v2(p_client text, p_calls integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 t timestamptz := clock_timestamp();
 day_start timestamptz := date_trunc('day', t at time zone 'UTC') at time zone 'UTC';
 spent numeric; batch_id uuid;
begin
 if p_calls is null or p_calls < 1 or p_calls > 6 or p_client is null or p_client !~ '^[a-f0-9]{64}$' then
  return jsonb_build_object('error','INVALID_RESERVATION');
 end if;
 -- Global lock is shared across every Edge isolate and client.
 perform pg_advisory_xact_lock(hashtextextended('runlu_forum_ai_v2', 0));
 -- Serialize with v1 reservations during a rolling replacement.
 perform pg_advisory_xact_lock(hashtextextended('runlu_forum_ai_budget:' || (t at time zone 'UTC')::date::text, 0));
 if exists(select 1 from forum_ai_private.batches where not finished and lease_until > t) then
  return jsonb_build_object('error','FORUM_BUSY');
 end if;
 if (select count(*) from forum_ai_private.batches where created_at > t - interval '1 minute') >= 6 then
  return jsonb_build_object('error','RATE_LIMITED');
 end if;
 if coalesce((select sum(calls) from forum_ai_private.batches where client_hash=p_client and created_at >= day_start),0) + p_calls > 12 then
  return jsonb_build_object('error','CLIENT_DAILY_LIMIT');
 end if;
 -- A ten-minute overlap charges cross-midnight requests against both days.
 select coalesce(sum(reserved_usd),0) into spent from forum_ai_private.batches where created_at >= day_start - interval '10 minutes';
 spent := spent + coalesce((select sum(estimated_cost_usd) from public.forum_ai_usage where usage_date >= (t at time zone 'UTC')::date),0);
 if spent + p_calls * 0.05 > 2.00 then
  return jsonb_build_object('error','DAILY_BUDGET_EXHAUSTED');
 end if;
 insert into forum_ai_private.batches(client_hash,calls,reserved_usd)
 values(p_client,p_calls,p_calls * 0.05) returning id into batch_id;
 return jsonb_build_object('id',batch_id);
end $$;

create or replace function public.forum_ai_finish_v2(p_id uuid)
returns void language sql security definer set search_path = '' as $$
 update forum_ai_private.batches set finished=true where id=p_id;
$$;
create or replace function public.forum_ai_record_v2(p_id uuid,p_provider text,p_success boolean,p_usage jsonb,p_cost numeric,p_fingerprint text)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not exists(select 1 from forum_ai_private.batches where id=p_id and not finished and lease_until > clock_timestamp()) then
  raise exception 'Invalid batch';
 end if;
 insert into forum_ai_private.health(provider,verified_at,key_fingerprint,last_usage,last_cost)
 values(p_provider,case when p_success then clock_timestamp() else null end,p_fingerprint,p_usage,p_cost)
 on conflict(provider) do update set verified_at=excluded.verified_at,key_fingerprint=excluded.key_fingerprint,last_usage=excluded.last_usage,last_cost=excluded.last_cost;
end $$;
create or replace function public.forum_ai_status_v2()
returns jsonb language sql security definer set search_path = '' as $$
 with usage as (
 select coalesce(sum(reserved_usd),0) + coalesce((select sum(estimated_cost_usd) from public.forum_ai_usage where usage_date >= (clock_timestamp() at time zone 'UTC')::date),0) spent
 from forum_ai_private.batches
 where created_at >= (date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC') - interval '10 minutes'
 )
 select jsonb_build_object('budget',jsonb_build_object('date',(clock_timestamp() at time zone 'UTC')::date,'reserved_usd',spent,'daily_budget_usd',2.00,'remaining_usd',greatest(2.00-spent,0),'basis','conservative reservations, USD, UTC'),
 'verified',coalesce((select jsonb_object_agg(provider,key_fingerprint) from forum_ai_private.health where verified_at > clock_timestamp()-interval '15 minutes'),'{}'::jsonb)) from usage;
$$;
-- Privileged RPCs are exclusively server-side; no browser-supplied budget constants.
revoke all on function public.forum_ai_reserve_v2(text,integer) from public, anon, authenticated;
revoke all on function public.forum_ai_finish_v2(uuid) from public, anon, authenticated;
revoke all on function public.forum_ai_record_v2(uuid,text,boolean,jsonb,numeric,text) from public, anon, authenticated;
revoke all on function public.forum_ai_status_v2() from public, anon, authenticated;
grant execute on function public.forum_ai_reserve_v2(text,integer), public.forum_ai_finish_v2(uuid), public.forum_ai_record_v2(uuid,text,boolean,jsonb,numeric,text), public.forum_ai_status_v2() to service_role;
commit;
