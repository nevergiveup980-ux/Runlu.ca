# RUNLU MUSIC — existing credit RPC audit (2026-11-08)

Read-only inspection of production Supabase project `ekrnknlawekeoszzkamd`.
No production changes, purchases, credit consumption or paid provider requests.

## Confirmed existing RPC
`public.runlu_consume_credit(p_user_id uuid, p_plan_key text, p_usage_reference text, p_units integer default 1)`
is a SECURITY DEFINER PL/pgSQL function.

- Looks up an existing consumption by `(user_id, plan_key, usage_reference)`; returns its units on replay.
- Validates that `plan_key` has `fulfillment_mode='consumable_credit'`.
- Checks sum of unconsumed active grants, inserts one consumption record, then allocates
  units from credit rows selected `FOR UPDATE`, writing usage records.
- A database UNIQUE constraint exists on `(user_id,plan_key,usage_reference)`.

## Safety gaps to resolve before using it for RUNLU MUSIC
1. The balance check precedes `FOR UPDATE`. Concurrent requests with **different**
   usage references may both see sufficient funds; the second can encounter
   constraint errors or inconsistent allocation attempts. Test concurrency explicitly.
2. Existing-consumption replay returns the previous unit count without checking
   whether the new `p_units` matches. RUNLU MUSIC should fix units to 1 and
   verify the immutable job payload for an idempotency-key replay.
3. A credit consumption and music-job insertion are not currently one operation.
   Implement a reviewed, server-only atomic RPC that creates the job and
   consumes the credit in a single transaction. On exception, both roll back.
4. Verify the function's EXECUTE grants and the server authentication boundary.
   SECURITY DEFINER alone does not guarantee safe exposure.
5. A failed/ambiguous provider call needs manual reconciliation; do not
   automatically retry or refund.
6. Determine the exact music `plan_key` and `product_key` from the approved
   catalog before enabling charges. Do not silently reuse another product's credits.

## Proposed acceptance tests (isolated staging DB)
- Same key + same project twice -> one job, one consumption.
- Same key + changed lyrics -> rejected, no extra consumption.
- Different keys competing for last credit -> one job succeeds, other fails safely.
- Job insert failure -> no consumption persists.
- No credit -> no provider request.
- User A cannot read/download user B's song.
- Provider timeout -> `needs_review` and no automatic second request.

## Gate
Do not apply `music/db/atomic-credit-reservation.review.sql` unchanged:
it uses a parallel `runlu_music_credits` wallet. Integrate with existing
`runlu_consumable_credits` after staging tests and security review.
