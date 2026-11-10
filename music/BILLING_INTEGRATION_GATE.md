# RUNLU MUSIC — billing integration gate (read-only audit)

Date: 2026-11-08. Production Supabase project: `ekrnknlawekeoszzkamd`.

## Verified directly in database
- `public.runlu_consume_credit(uuid,text,text,integer)` EXECUTE ACL is
  `{postgres=X/postgres,service_role=X/postgres}`. Browser roles are not granted direct EXECUTE.
- No `runlu_product_plans` row has a `plan_key` or `product_key` containing `music`.
- Existing credit consumption has a unique `(user_id,plan_key,usage_reference)` constraint.

## Integration decisions
1. Keep music billing **disabled** until a music-specific product and plan are
   approved and registered. Never consume unrelated RUNLU product credits.
2. Keep privileged RPCs server-only; verify Supabase Auth identity on every request.
3. Implement one server-only transaction to create a music job and consume exactly
   one music credit. Use a stable immutable job reference for idempotency.
4. Enforce same idempotency key + different project = rejection.
5. A database uniqueness constraint is necessary but not sufficient for robust
   concurrent balance allocation. Exercise two distinct requests competing for
   the last credit in an isolated database before enabling billing.
6. Never retry ambiguous billable provider requests automatically. Persist
   `needs_review` and reconcile charges manually.
7. Do not enable the UI purchase or generation control merely because offline
   CI is green.

## Acceptance gate
- Separate staging project or isolated transaction-safe test database;
  no production credit consumption.
- Verify atomic rollback, parallel submissions, cross-account isolation,
  provider timeout handling and download authorization.
- Explicit user approval required before changing production billing,
  creating purchasable plans or invoking paid music generation.
