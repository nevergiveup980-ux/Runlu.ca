-- RUNLU Flooring OS Universal · U2 Cloud Tenant Foundation
-- DESIGN ONLY. Do not apply to Deerfoot production.
create table if not exists public.flooring_universal_organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table if not exists public.flooring_universal_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flooring_universal_organizations(id) on delete cascade,
  name text not null,
  location_type text not null default 'store',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.flooring_universal_members (
  organization_id uuid not null references public.flooring_universal_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null check (role_key in ('owner','admin','manager','sales','warehouse','installer','accounting','viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (organization_id,user_id)
);
create table if not exists public.flooring_universal_member_locations (
  organization_id uuid not null,
  location_id uuid not null references public.flooring_universal_locations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (location_id,user_id),
  foreign key (organization_id,user_id) references public.flooring_universal_members(organization_id,user_id) on delete cascade
);
alter table public.flooring_universal_organizations enable row level security;
alter table public.flooring_universal_locations enable row level security;
alter table public.flooring_universal_members enable row level security;
alter table public.flooring_universal_member_locations enable row level security;
-- RLS policies intentionally live in the companion isolation file and must be tested on a non-production Universal environment first.
