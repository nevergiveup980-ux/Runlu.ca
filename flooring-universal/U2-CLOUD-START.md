# U2 Cloud Tenant Foundation — Start Gate

U2 begins after the frozen U1 local business lifecycle.

## Safety decision
The currently connected general Supabase project contains existing Flooring/Deerfoot-era data. U2 tenant tables are therefore **not applied there** during this step. No production schema or data is changed.

## U2 target
Authenticated User → Organization → Location → Membership → Role → Tenant-owned Flooring records.

Authorization must come from database membership/RLS, never user-editable metadata. Every exposed table uses RLS. UPDATE policies require SELECT + USING + WITH CHECK. No service-role key belongs in the browser.

## First cloud milestone
1. Provision a separate Universal development environment.
2. Apply tenant foundation schema there.
3. Apply membership-based RLS.
4. Verify two-tenant isolation with real authenticated test users.
5. Only then port U1 Jobs/PO/Receiving/Installation/Billing data contracts to cloud ownership.

The Deerfoot mother version and its production data remain outside this migration.
