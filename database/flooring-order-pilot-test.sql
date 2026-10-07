begin;
-- Synthetic identities exist only within this rolled-back transaction. No emails or sessions.
insert into auth.users(id) values ('00000000-0000-4000-8000-000000000071'), ('00000000-0000-4000-8000-000000000072');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000071',true);
insert into public.flooring_order_pilot(id,owner_id,customer,description,quantity,unit_price) values ('00000000-0000-4000-8000-000000000073','00000000-0000-4000-8000-000000000071','QA fictional','QA line',2,10);
update public.flooring_order_pilot set quantity=3 where id='00000000-0000-4000-8000-000000000073' and revision=1;
do $$ begin
 if not exists(select 1 from public.flooring_order_pilot where id='00000000-0000-4000-8000-000000000073' and revision=2 and quantity=3) then raise exception 'Owner update/version failed'; end if;
 update public.flooring_order_pilot set quantity=9 where id='00000000-0000-4000-8000-000000000073' and revision=1;
 if found then raise exception 'Stale version overwrote row'; end if;
 begin
  update public.flooring_order_pilot set quantity=0 where id='00000000-0000-4000-8000-000000000073';
  raise exception 'Invalid quantity accepted';
 exception when check_violation then null; end;
 begin
  update public.flooring_order_pilot set owner_id='00000000-0000-4000-8000-000000000072' where id='00000000-0000-4000-8000-000000000073';
  raise exception 'Owner reassignment accepted';
 exception when raise_exception then
  if sqlerrm <> 'Order identity cannot change' then raise; end if;
 end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000072',true);
do $$ begin
 if exists(select 1 from public.flooring_order_pilot where id='00000000-0000-4000-8000-000000000073') then raise exception 'Cross-account read leaked'; end if;
 update public.flooring_order_pilot set quantity=8 where id='00000000-0000-4000-8000-000000000073';
 if found then raise exception 'Cross-account update allowed'; end if;
 begin
  insert into public.flooring_order_pilot(id,owner_id,customer,description,quantity,unit_price) values ('00000000-0000-4000-8000-000000000074','00000000-0000-4000-8000-000000000071','QA','QA',1,1);
  raise exception 'Cross-account insert allowed';
 exception when insufficient_privilege then null; end;
 begin
  delete from public.flooring_order_pilot;
  raise exception 'Deletion allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
 begin
  perform * from public.flooring_order_pilot;
  raise exception 'Anonymous read allowed';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
