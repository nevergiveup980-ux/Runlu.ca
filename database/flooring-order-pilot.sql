-- Isolated pilot only. No references to installed jobs, PO, inventory or payments.
create table public.flooring_order_pilot (
 id uuid primary key,
 owner_id uuid not null references auth.users(id) on delete cascade,
 customer text not null check (length(customer) between 1 and 160),
 description text not null check (length(description) between 1 and 500),
 quantity numeric not null check (quantity > 0 and quantity <= 1000000),
 unit_price numeric not null check (unit_price >= 0 and unit_price <= 1000000),
 status text not null default 'draft' check (status in ('draft','confirmed')),
 revision integer not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.flooring_order_pilot enable row level security;
revoke all on public.flooring_order_pilot from public, anon, authenticated;
grant select, insert, update on public.flooring_order_pilot to authenticated;
create policy pilot_read_own on public.flooring_order_pilot for select to authenticated using ((select auth.uid()) = owner_id);
create policy pilot_insert_own on public.flooring_order_pilot for insert to authenticated with check ((select auth.uid()) = owner_id and revision = 1);
create policy pilot_update_own on public.flooring_order_pilot for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create function public.flooring_order_pilot_version() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if new.owner_id <> old.owner_id or new.id <> old.id then raise exception 'Order identity cannot change'; end if;
 new.revision := old.revision + 1;
 new.updated_at := now();
 return new;
end $$;
revoke all on function public.flooring_order_pilot_version() from public, anon, authenticated;
create trigger flooring_order_pilot_version before update on public.flooring_order_pilot for each row execute function public.flooring_order_pilot_version();
