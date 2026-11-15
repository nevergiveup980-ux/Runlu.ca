begin;
create schema if not exists runlu_music_internal;
revoke all on schema runlu_music_internal from public,anon,authenticated;
create function runlu_music_internal.preserve_music_version() returns trigger
language plpgsql set search_path='' as $$
begin
  if old.generation_status in ('completed','imported') then
    raise exception 'SAVED_MUSIC_VERSION_IMMUTABLE';
  end if;
  if new.version_id<>old.version_id or new.song_id<>old.song_id or new.owner_id<>old.owner_id or new.created_at<>old.created_at then
    raise exception 'MUSIC_VERSION_IDENTITY_IMMUTABLE';
  end if;
  return new;
end $$;
revoke all on function runlu_music_internal.preserve_music_version() from public,anon,authenticated;
create trigger preserve_music_version before update on public.runlu_music_versions
for each row execute function runlu_music_internal.preserve_music_version();
-- Invoker rights, no privilege escalation; callable only by trusted publisher.
create function public.runlu_music_publish_version(
  p_owner uuid,p_song uuid,p_version_id uuid,p_title text,p_version text,
  p_status text,p_duration double precision,p_sha256 text,p_audio_bytes bigint
) returns uuid language plpgsql security invoker set search_path='' as $$
begin
  if p_status not in ('completed','imported') then raise exception 'INVALID_PUBLISH_STATUS'; end if;
  if not exists(select 1 from auth.users where id=p_owner and coalesce(is_anonymous,false)=false) then raise exception 'OWNER_REQUIRED'; end if;
  insert into public.runlu_music_songs(song_id,owner_id) values(p_song,p_owner)
    on conflict(song_id) do nothing;
  if not exists(select 1 from public.runlu_music_songs where song_id=p_song and owner_id=p_owner) then raise exception 'SONG_OWNER_MISMATCH'; end if;
  insert into public.runlu_music_versions(version_id,song_id,owner_id,title,version,generation_status,object_key,duration,sha256,audio_bytes)
  values(p_version_id,p_song,p_owner,p_title,p_version,p_status,p_owner::text||'/'||p_version_id::text||'.mp3',p_duration,p_sha256,p_audio_bytes);
  return p_version_id;
end $$;
revoke all on function public.runlu_music_publish_version(uuid,uuid,uuid,text,text,text,double precision,text,bigint) from public,anon,authenticated;
grant execute on function public.runlu_music_publish_version(uuid,uuid,uuid,text,text,text,double precision,text,bigint) to service_role;
commit;
