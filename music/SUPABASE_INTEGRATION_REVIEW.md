# RUNLU MUSIC — Supabase integration review (read-only discovery, 2026-11-08)

## Verified existing infrastructure
- RUNLU Supabase project: `ekrnknlawekeoszzkamd` (Canada Central, ACTIVE_HEALTHY).
- Existing RLS-enabled commerce tables: `public.runlu_consumable_credits`, `public.runlu_consumable_usage`, `public.runlu_consumable_consumptions`, `public.runlu_consumable_revocations`, and `public.runlu_entitlements`.
- Existing Stripe Edge Functions include checkout, webhook, and portal.
- No `public.runlu_music_credits` or `public.runlu_music_jobs` tables were present in the read-only table listing.

## Architecture decision before migration
Do **not** create a second independent music credit wallet by applying
`music/db/private-beta-schema.review.sql` unchanged. RUNLU already has a
consumable-credit ledger. A parallel wallet would create inconsistent balances,
refunds, cancellations and duplicate-charge risks.

Prefer:
1. Music jobs table scoped to `auth.users.id` with RLS.
2. Reserve one music unit via a **reviewed, atomic** server-side transaction
   using the existing `runlu_consumable_credits` / consumption machinery,
   keyed to an immutable music job ID / idempotency key.
3. Verify `product_key`, `plan_key`, purchase status and existing consumption
   uniqueness constraints before implementing reservation.
4. On provider timeout, mark `needs_review`; never automatically retry or
   refund without reconciliation.
5. Private storage bucket and short-lived signed URLs for completed audio.
6. Edge Function routes must authenticate using Supabase Auth and reject
   direct browser access to service-role credentials.

## Safety gate
This file is a design review, not authorization to modify the database.
No migrations, live Edge Functions, bucket creation, checkout changes or
billable music generation are part of this change.
