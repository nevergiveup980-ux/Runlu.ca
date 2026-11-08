-- RUNLU MUSIC atomic credit reservation — REVIEW ONLY, NOT APPLIED.
-- Requires music/db/private-beta-schema.review.sql to be reviewed/applied first.
-- Server-only RPC, private schema not exposed through Supabase Data API.
-- Never call this from a browser or with an anon/publishable key.
create schema if not exists runlu_music_private;
revoke all on schema runlu_music_private from public, anon, authenticated;
grant usage on schema runlu_music_private to service_role;

create or replace function runlu_music_private.reserve_song_job(
  p_user_id uuid,
  p_key text,
  p_project jsonb
)
returns table(job_id uuid, job_status text, was_created boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.runlu_music_jobs%rowtype;
  v_available integer;
  v_job_id uuid;
begin
  if p_user_id is null or p_key is null or p_key !~ '^[A-Za-z0-9_-]{16,128}$'
     or p_project is null or jsonb_typeof(p_project) <> 'object' then
    raise exception 'INVALID_REQUEST' using errcode = '22023';
  end if;
  -- Validate full project contract in the trusted server before calling RPC.
  -- Lock one account row first: concurrent requests for this user serialize.
  select available into v_available
    from public.runlu_music_credits
   where user_id = p_user_id
   for update;
  if not found then
    raise exception 'NO_CREDIT_ACCOUNT' using errcode = 'P0001';
  end if;

  -- Idempotency check MUST precede balance check so a replay succeeds at zero balance.
  select * into v_existing
    from public.runlu_music_jobs
   where user_id = p_user_id and idempotency_key = p_key;
  if found then
    return query select v_existing.id, v_existing.status, false;
    return;
  end if;

  if v_available < 1 then
    raise exception 'INSUFFICIENT_CREDITS' using errcode = 'P0001';
  end if;

  update public.runlu_music_credits
     set available = available - 1, reserved = reserved + 1, updated_at = now()
   where user_id = p_user_id;

  insert into public.runlu_music_jobs(user_id, idempotency_key, project, status, credits_reserved)
  values(p_user_id, p_key, p_project, 'queued', 1)
  returning id into v_job_id;

  return query select v_job_id, 'queued'::text, true;
end;
$$;

-- PostgreSQL functions otherwise inherit PUBLIC EXECUTE: explicitly restrict it.
revoke all on function runlu_music_private.reserve_song_job(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function runlu_music_private.reserve_song_job(uuid,text,jsonb) to service_role;

-- IMPORTANT deployment review:
-- 1. Verify runlu_music_private is NOT an exposed API schema.
-- 2. Verify the worker uses server-held service_role only, and validates Supabase user via getUser().
-- 3. Check function owner, grants and pg_proc security-definer audit before production.
-- 4. Never grant direct client EXECUTE. Add spend caps and refund reconciliation separately.
