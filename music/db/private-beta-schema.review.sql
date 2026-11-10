-- RUNLU MUSIC private beta schema DRAFT — review before applying.
-- No live database change is performed by committing this file.
-- Production worker uses server-side privileged credentials only.
create table if not exists public.runlu_music_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available integer not null default 0 check (available >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.runlu_music_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null check (length(idempotency_key) between 16 and 128),
  project jsonb not null,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','needs_review')),
  credits_reserved integer not null default 1 check (credits_reserved = 1),
  object_key text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,idempotency_key),
  check (status <> 'completed' or object_key is not null)
);
create index if not exists runlu_music_jobs_owner_created_idx on public.runlu_music_jobs(user_id,created_at desc);
create index if not exists runlu_music_jobs_queue_idx on public.runlu_music_jobs(created_at) where status='queued';

alter table public.runlu_music_credits enable row level security;
alter table public.runlu_music_jobs enable row level security;

-- Authenticated customers can read their own balance and job status only.
-- No INSERT/UPDATE/DELETE grants for clients; all mutations go through server.
revoke all on public.runlu_music_credits from anon, authenticated;
revoke all on public.runlu_music_jobs from anon, authenticated;
grant select on public.runlu_music_credits to authenticated;
grant select (id,user_id,status,error_code,created_at,updated_at) on public.runlu_music_jobs to authenticated;
drop policy if exists runlu_music_credits_read_own on public.runlu_music_credits;
create policy runlu_music_credits_read_own on public.runlu_music_credits
for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists runlu_music_jobs_read_own on public.runlu_music_jobs;
create policy runlu_music_jobs_read_own on public.runlu_music_jobs
for select to authenticated using ((select auth.uid())=user_id);

-- Private storage bucket creation, signed downloads, and atomic credit reservation
-- require a separately reviewed server-side implementation; intentionally omitted.
-- DO NOT expose project lyrics or object_key through the client Data API.
