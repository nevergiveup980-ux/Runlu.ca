# RUNLU Account V1

Status: private pilot / not linked from the public site.

## Purpose

Create one optional RUNLU identity layer without forcing existing RUNLU products to use an account.

## V1 scope

- Email + password sign-up
- Email + password sign-in
- Password recovery
- Sign-out
- Private profile: display name + preferred language
- Four-language account UI: English / 中文 / Français / Español
- Honest placeholders for Library, Orders, and Subscriptions; no fake purchase or entitlement data

## Backend

Supabase project: `ekrnknlawekeoszzkamd` (Canada Central).

Database table: `public.runlu_profiles`

Security rules:
- RLS enabled
- authenticated users may select only their own profile
- authenticated users may update only their own `display_name` and `locale`
- tier/status are server-controlled, not client-editable
- no anonymous profile access
- auth trigger creates the private profile after a new Supabase Auth user is created

## Public-launch gates

Do not add Account to the public navigation until all of these pass:

1. Confirm `https://runlu.ca/account.html` is an allowed Auth redirect URL and the Auth Site URL is correct.
2. Configure production SMTP for RUNLU transactional mail (`no-reply@runlu.ca`) rather than relying on Supabase's default test sender.
3. Enable leaked-password protection or document why the project tier cannot enable it yet.
4. Test: sign-up → confirmation → sign-in → profile edit → sign-out.
5. Test: forgot password → recovery link → new password → sign-in.
6. Verify mobile Safari and desktop Safari/Chrome.
7. Verify no account page or auth flow changes existing Warehouse OS, Universal Invoice, Ledger, Forum, or other product data.
8. Review Privacy and Support wording before public navigation is enabled.

## Rollout rule

Account remains optional at launch. Existing products stay usable under their current model until a specific product has a real need for cloud identity, entitlement, sync, or subscription management.
