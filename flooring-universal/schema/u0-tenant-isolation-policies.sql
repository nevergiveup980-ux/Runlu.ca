-- RUNLU Flooring OS Universal · U0 tenant isolation policy draft
-- DESIGN ONLY. Do not apply to Deerfoot production.
-- This draft assumes the U0 tenant tables from u0-tenant-foundation.sql.

-- Membership is the authorization source. Never authorize from user-editable metadata.

-- Organizations: members may read their organization.
create policy "universal_org_member_read"
on public.flooring_universal_organizations
for select to authenticated
using (
  exists (
    select 1
    from public.flooring_universal_members m
    where m.organization_id = flooring_universal_organizations.id
      and m.user_id = (select auth.uid())
      and m.active = true
  )
);

-- Locations: members may read locations in their organization.
create policy "universal_location_member_read"
on public.flooring_universal_locations
for select to authenticated
using (
  exists (
    select 1
    from public.flooring_universal_members m
    where m.organization_id = flooring_universal_locations.organization_id
      and m.user_id = (select auth.uid())
      and m.active = true
  )
);

-- Membership directory: a member may see membership rows only inside organizations
-- to which that same authenticated user belongs.
create policy "universal_members_same_org_read"
on public.flooring_universal_members
for select to authenticated
using (
  exists (
    select 1
    from public.flooring_universal_members self
    where self.organization_id = flooring_universal_members.organization_id
      and self.user_id = (select auth.uid())
      and self.active = true
  )
);

create policy "universal_member_locations_same_org_read"
on public.flooring_universal_member_locations
for select to authenticated
using (
  exists (
    select 1
    from public.flooring_universal_members self
    where self.organization_id = flooring_universal_member_locations.organization_id
      and self.user_id = (select auth.uid())
      and self.active = true
  )
);

-- IMPORTANT:
-- No INSERT/UPDATE/DELETE policy is enabled in U0 yet.
-- Tenant provisioning and role changes require a separately reviewed control path.
-- Future business tables must carry organization_id and use the same membership
-- boundary. Location-scoped records additionally require a permitted location.

-- Required isolation tests before activation:
-- 1. User A in Org A can read Org A.
-- 2. User A cannot read Org B.
-- 3. User A cannot read Org B locations.
-- 4. User A cannot enumerate Org B members.
-- 5. Inactive membership loses access.
-- 6. Anonymous user reads nothing.
-- 7. Authenticated user with no membership reads nothing.
-- 8. Cross-tenant record ID guessing returns no row.
-- 9. UPDATE tests must verify both USING and WITH CHECK when writes are added.
-- 10. Never use TO authenticated by itself as authorization.
