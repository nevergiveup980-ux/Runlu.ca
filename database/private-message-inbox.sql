-- Reference for applied migration runlu_private_message_inbox_owner_access.
-- Existing runlu_profiles.staff_role is server-managed; users cannot update it.
alter table public.runlu_messages enable row level security;
grant select (id,category,name,email,message,wants_reply,language,status,created_at) on public.runlu_messages to authenticated;
grant update (status) on public.runlu_messages to authenticated;
create policy runlu_messages_owner_read on public.runlu_messages for select to authenticated
using (exists (select 1 from public.runlu_profiles p where p.user_id=(select auth.uid()) and p.staff_role='owner' and p.account_status='active'));
create policy runlu_messages_owner_status on public.runlu_messages for update to authenticated
using (exists (select 1 from public.runlu_profiles p where p.user_id=(select auth.uid()) and p.staff_role='owner' and p.account_status='active'))
with check (exists (select 1 from public.runlu_profiles p where p.user_id=(select auth.uid()) and p.staff_role='owner' and p.account_status='active'));
