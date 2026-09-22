-- RUNLU Flooring OS Universal · U0 tenant foundation
-- DESIGN ONLY. Do not apply to Deerfoot production.
-- Target: a separate Universal development database/branch after explicit approval.

create table if not exists public.flooring_universal_organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  abbreviation text,
  country_code text not null default 'CA',
  region_code text,
  currency_code text not null default 'CAD',
  locale text not null default 'en-CA',
  timezone text not null default 'America/Edmonton',
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flooring_universal_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.flooring_universal_organizations(id) on delete cascade,
  name text not null,
  location_type text not null default 'store' check (location_type in ('store','warehouse','office','combined')),
  region_code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.flooring_universal_members (
  organization_id uuid not null references public.flooring_universal_organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null check (role_key in ('owner','admin','manager','sales','warehouse','installer','accounting','viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.flooring_universal_member_locations (
  organization_id uuid not null,
  user_id uuid not null,
  location_id uuid not null references public.flooring_universal_locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id, location_id),
  foreign key (organization_id, user_id)
    references public.flooring_universal_members(organization_id, user_id) on delete cascade
);

alter table public.flooring_universal_organizations enable row level security;
alter table public.flooring_universal_locations enable row level security;
alter table public.flooring_universal_members enable row level security;
alter table public.flooring_universal_member_locations enable row level security;

-- RLS policies are intentionally not included in this first schema draft.
-- They must be designed and isolation-tested before these tables are exposed
-- through the Data API. Never rely on TO authenticated alone for authorization.
