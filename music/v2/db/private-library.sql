-- Approved additive V2 configuration. No credit ledger, generation or public media.
begin;
create table public.runlu_music_songs (
  song_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(song_id,owner_id)
);
create table public.runlu_music_versions (
  version_id uuid primary key default gen_random_uuid(),
  song_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(length(btrim(title)) between 1 and 120),
  version text not null check(version in ('V1','V2')),
  created_at timestamptz not null default now(),
  generation_status text not null check(generation_status in ('pending','running','completed','imported','failed','needs_review')),
  object_key text unique,
  duration double precision,
  sha256 text,
  audio_bytes bigint,
  foreign key(song_id,owner_id) references public.runlu_music_songs(song_id,owner_id) on delete cascade,
  check(object_key is null or object_key=owner_id::text||'/'||version_id::text||'.mp3'),
  check((generation_status in ('completed','imported') and object_key is not null and duration is not null and sha256 is not null and audio_bytes is not null and duration>0 and duration<1200 and sha256 ~ '^[0-9a-f]{64}$' and audio_bytes between 128 and 52428800)
     or (generation_status not in ('completed','imported') and object_key is null and duration is null and sha256 is null and audio_bytes is null))
);
create index runlu_music_versions_owner_created_idx on public.runlu_music_versions(owner_id,created_at desc,version_id desc);
alter table public.runlu_music_songs enable row level security;
alter table public.runlu_music_versions enable row level security;
revoke all on public.runlu_music_songs,public.runlu_music_versions from public,anon,authenticated;
grant select on public.runlu_music_songs,public.runlu_music_versions to authenticated;
grant all on public.runlu_music_songs,public.runlu_music_versions to service_role;
create policy music_songs_read_owner on public.runlu_music_songs for select to authenticated
using ((select auth.uid())=owner_id and coalesce((select auth.jwt())->>'is_anonymous','false')='false');
create policy music_versions_read_owner on public.runlu_music_versions for select to authenticated
using ((select auth.uid())=owner_id and coalesce((select auth.jwt())->>'is_anonymous','false')='false');
-- Storage objects are server-written. No client INSERT/UPDATE/DELETE grants/policies.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('runlu-music-private','runlu-music-private',false,52428800,array['audio/mpeg']);
create policy music_audio_read_owner on storage.objects for select to authenticated
using (bucket_id='runlu-music-private'
  and coalesce((select auth.jwt())->>'is_anonymous','false')='false'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.runlu_music_versions v where v.object_key=name and v.owner_id=(select auth.uid()) and v.generation_status in ('completed','imported')));
comment on table public.runlu_music_versions is 'Private music versions. Server-only writes; immutable version UUID and object path; never expose public bucket URLs.';
commit;
