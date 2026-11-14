-- Real database authorization tests; all fixtures are rolled back.
begin;
insert into auth.users(id,is_anonymous) values
 ('00000000-0000-4000-8000-000000000a01',false),
 ('00000000-0000-4000-8000-000000000b02',false);
select public.runlu_music_publish_version(
 '00000000-0000-4000-8000-000000000a01','00000000-0000-4000-8000-000000001a01',
 '00000000-0000-4000-8000-000000002a01','Rollback song','V1','imported',182,repeat('a',64),1000);
select public.runlu_music_publish_version(
 '00000000-0000-4000-8000-000000000a01','00000000-0000-4000-8000-000000001a01',
 '00000000-0000-4000-8000-000000002a02','Rollback song','V2','imported',183,repeat('b',64),1000);
do $$ begin
  if (select count(*) from public.runlu_music_versions where song_id='00000000-0000-4000-8000-000000001a01')<>2 then raise exception 'VERSIONS_NOT_PRESERVED'; end if;
  begin update public.runlu_music_versions set title='forbidden' where version_id='00000000-0000-4000-8000-000000002a01'; raise exception 'IMMUTABILITY_FAILED';
  exception when raise_exception then if SQLERRM<>'SAVED_MUSIC_VERSION_IMMUTABLE' then raise; end if; end;
  begin insert into public.runlu_music_versions(song_id,owner_id,title,version,generation_status)
    values('00000000-0000-4000-8000-000000001a01','00000000-0000-4000-8000-000000000a01','fake success','V2','completed'); raise exception 'FAKE_SUCCESS_ALLOWED';
  exception when check_violation then null; end;
end $$;
-- Metadata-only fake object row, never an actual file. Rolled back below.
insert into storage.objects(bucket_id,name) select 'runlu-music-private',object_key from public.runlu_music_versions where song_id='00000000-0000-4000-8000-000000001a01';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000a01","role":"authenticated","is_anonymous":false}',true);
do $$ begin
 if (select count(*) from public.runlu_music_versions)<>2 then raise exception 'OWNER_READ_FAILED'; end if;
 if (select count(*) from storage.objects where bucket_id='runlu-music-private')<>2 then raise exception 'OWNER_STORAGE_FAILED'; end if;
 begin update public.runlu_music_versions set title='forbidden'; raise exception 'CLIENT_WRITE_ALLOWED'; exception when insufficient_privilege then null; end;
 begin perform public.runlu_music_publish_version(null,null,null,null,null,null,null,null,null); raise exception 'CLIENT_RPC_ALLOWED'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000b02","role":"authenticated","is_anonymous":false}',true);
do $$ begin
 if (select count(*) from public.runlu_music_versions)<>0 then raise exception 'CROSS_USER_READ_ALLOWED'; end if;
 if (select count(*) from storage.objects where bucket_id='runlu-music-private')<>0 then raise exception 'CROSS_USER_STORAGE_ALLOWED'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000a01","role":"authenticated","is_anonymous":true}',true);
do $$ begin
 if (select count(*) from public.runlu_music_versions)<>0 or (select count(*) from storage.objects where bucket_id='runlu-music-private')<>0 then raise exception 'ANONYMOUS_USER_READ_ALLOWED'; end if;
end $$;
set local role anon;
do $$ begin
 begin perform * from public.runlu_music_versions; raise exception 'UNAUTHENTICATED_READ_ALLOWED'; exception when insufficient_privilege then null; end;
 if (select count(*) from storage.objects where bucket_id='runlu-music-private')<>0 then raise exception 'UNAUTHENTICATED_STORAGE_ALLOWED'; end if;
end $$;
rollback;
