# Stripe ordering: isolated transactional candidate

Not deployed. No production credentials, Stripe requests, Supabase mutations,
Edge Function deployment, or production migration are included in this experiment.
Run `node scripts/check-stripe-atomic-replay.mjs` with Node 22.13+ or 24.

## PostgreSQL and signed HTTP lab (2026-11-08)

The next layer is executable PL/pgSQL, not a JavaScript simulation:

```
cd experiments/stripe-ordering
npm ci --ignore-scripts
npm test
```

Dependencies are pinned with a lockfile. The default backend is an ephemeral,
embedded PGlite PostgreSQL database; no hosted database is contacted. A dedicated
Actions job also runs the same SQL and tests against a fresh PostgreSQL 17.7
service, using independent pooled sessions. The explicit server URL is restricted
to loopback, database `runlu_stripe_lab`, role `runlu_lab_owner`, and a schema that
does not yet exist. Never pass a production URL to this harness. A failure leaves
the disposable CI database for diagnostics; there is no DROP DATABASE command.

`lab-schema.sql` creates ONLY fixture roles and the private `runlu_stripe_lab`
schema. It is deliberately outside `supabase/migrations`. The invoker RPC revokes
PUBLIC execution; anonymous/authenticated fixture roles have no access, and all
four fixture tables enable RLS. The service role has explicit grants and bypasses
RLS, analogous to a trusted backend. Tests exercise denied access, not just inspect
the SQL. Advisory transaction locks fence receipt identity and subscription
creation; revision fencing rejects an authoritative response fetched before a
competing commit. Stale checks and terminal state checks run in SQL too. External
retrieval remains outside the transaction, so no Stripe call holds database locks.

`webhook.mjs` verifies HMAC over the raw request and timestamp, rejects live-mode
payloads, uses a server-owned correlation callback, and acknowledges only committed
applied/stale/duplicate outcomes. Errors return 503 without raw error details.
Tests include a real loopback HTTP round trip as well as Fetch API requests, using
synthetic test-mode JSON and a local signing secret. These are NOT Stripe CLI
fixtures and do NOT certify Stripe API compatibility or a deployed Deno runtime.

The server-only tests cover simultaneous first creation from separate sessions,
lock timeout returning 503 rather than false duplicate/200, and terminating a
connection with uncommitted state followed by a successful retry. All run only
against the disposable CI database, never the connected Supabase project.

This reduces the remaining gap but still uses fixture tables and fixture access
policy. It does not yet invoke the real RUNLU receipt, checkout correlation,
normalization or fulfillment RPCs. Porting those together into the transaction,
checking account/customer/price identity and verifying Stripe test-mode/Deno
integration remain release gates below. The production v14 bundle was re-read
on 2026-11-08 and still matched the version/hash recorded here.

## Read-only findings (2026-11-07)

Production project `ekrnknlawekeoszzkamd`, `runlu-stripe-webhook`, ACTIVE v14,
reported bundle SHA-256 `4dfc64a89432eb76c2423e16a92945a6360363703400aa723429ded5634a098e`.
Source was retrieved through get_edge_function. Only catalog SELECTs were used to
inspect subscription column names and four relevant RPC definitions; no customer
rows or secrets were read.

- `ensureSubscription()` writes status, period and cancellation before normalization.
- `invoice.paid` directly sets `active` and invoice line periods before fulfillment.
- Checkout's synthetic `incomplete` subscription can clear scheduled cancellation
  on an existing row. It must not be treated as a current subscription snapshot.
- `invoice.payment_failed` derives past-due policy from a historical invoice event;
  current subscription may already have recovered.
- Separate normalization/fulfillment/receipt RPC requests do not form one transaction.
  Entitlement ordering does not protect the earlier subscription writes.
- `runlu_claim_webhook_receipt` false includes processing, retry backoff and manual
  review, while v14 returns duplicate/200 for all false outcomes. A crash followed
  by an early retry could be acknowledged before processing has completed.

## Implemented in isolation

`processor.mjs` accepts only already verified/correlated envelopes. It rejects
invalid clocks; it never substitutes wall-clock time for Stripe chronology.
`sqlite-store.mjs` is a real local SQLite transaction adapter, with durable receipts,
subscription revision, paid-through entitlement and unique event effects. It
commits all four together or rolls back all four. These are fixture tables and
fixture entitlement semantics, not RUNLU production tables or entitlement RPCs.

Older events are completed as stale without modifying state. Other events fetch
an authoritative subscription through an injected adapter, including invoices and
Checkout: payment alone never implies active subscription. Same-second events
are reconciled; event ID lexical order is never used. Retrieval and validation
failure leaves the event retryable. Revision is read before retrieval and compared
inside the transaction, so an in-flight response cannot overwrite a newer commit.
On a conflict the entire read/retrieve/commit is retried with a bounded budget.
Terminal subscriptions fail closed on an inconsistent nonterminal response.
Scheduled cancellation retains active access until the exclusive period end.

Tests use only synthetic objects and temporary/in-memory databases. Fault injection
after subscription, entitlement and effect writes verifies real database rollback.
Concurrent promises test overlapping retrievals and duplicate delivery; they do
not prove production Postgres multi-worker locking or network behavior.

Validation: original ordering 8/8 and replay 6/6 passed under local Node v24.19.0;
the new atomic replay suite passed 17/17 under both local Node 24 and Node 22.
All Site integrity run blocks passed locally (Python blocks used `python3` because
this machine has no `python` alias). Upstream baseline `0141213` Site integrity run
42419924787 completed successfully. Remote CI for this change is reported separately.

## Production integration design and remaining release gates

1. Implement a reviewed, service-role-only Postgres RPC with explicit privileges,
   RLS for any new exposed table, and invoker security where possible. Use a unique
   provider/subscription key (including account and mode if multiple Stripe scopes
   are supported), persistent revision and provider timestamp/event identity.
   Lock/fence first creation as well as updates. Backfill existing rows from verified
   authoritative state; do not infer their clock from local updated_at.
2. Replace ALL v14 subscription-writing paths, including Checkout creation and both
   invoice paths. Keep signature verification, immutable checkout correlation,
   product/plan/customer ownership and live/test mode checks before this boundary.
   The experiment's booleans are test inputs, not an authentication mechanism.
3. Fetch current Stripe subscription after reading revision, validate identity,
   customer, account, mode and plan, then pass it with expected revision to the RPC.
   Fence failure must trigger a new fetch. Stripe failures or unresolved identities
   must return a retryable response, never fabricated state or successful duplicate.
4. In ONE database transaction: claim/inspect receipt, lock/fence subscription,
   assess ordering, update subscription, normalize canonical event, apply existing
   RUNLU entitlement policy and complete receipt. Audit stale/duplicate outcomes
   without fulfillment. Preserve idempotency and provider event payload hash.
   Ensure existing entitlement ordering can accept authoritative reconciliation
   for same-second conflicting events without silently discarding the correction.
5. Distinguish completed duplicate from busy/backoff/review. Return retryable status
   for transient busy/backoff, or persist work in a separately verified durable queue;
   do not swallow work with a false duplicate acknowledgement.
6. Port this suite to an isolated Supabase/Postgres database and the candidate HTTP
   Edge Function, exercising actual receipt and entitlement RPCs, permissions,
   initial-create races, multi-worker contention, process crashes and expired claims.
   Run Stripe test-mode signed fixtures (including API failure/recovery and missing
   period fields); no live charge or live event replay is authorized here.

This experiment is a tested reference implementation of the safety boundary, not
a production-ready v15 patch. No production migration or deployment is performed.
PR #402 must remain draft and unmerged. Historical live payment reconciliation and
any data repair remain separate, explicitly controlled work.

References: [Stripe event ordering](https://docs.stripe.com/webhooks#event-ordering),
[Supabase database functions](https://supabase.com/docs/guides/database/functions).
