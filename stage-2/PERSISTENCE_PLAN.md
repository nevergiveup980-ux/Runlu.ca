# Durable job + private asset persistence — design draft

The SQL migration is **not deployed**. This is PostgreSQL-oriented and is not automatically compatible with Cloudflare D1/SQLite.

## Required transaction design
- Authenticate user and derive owner_id from server-side session (never client-supplied).
- Submit with unique (owner_id,idempotency_key); on conflict return the existing job only if request hash matches.
- Worker claims one QUEUED job atomically with SELECT ... FOR UPDATE SKIP LOCKED, sets RUNNING and a lease deadline, then commits.
- Before every paid API call, reserve maximum provider spend in integer cents in a transaction. If available budget is insufficient, block.
- Persist provider task ID and unique attempt ID **before** submitting external work when API semantics permit. Use provider idempotency keys if supported.
- Record provider billing reconciliation as append-only events; never silently retry an unknown-billing timeout.
- Recovery of expired leases must inspect provider task status before any new paid submission.
- Download outputs into private object storage and validate bytes before VERIFIED; do not store credentials or signed URLs in events.
- Enforce RLS or equivalent owner-scoped authorization for jobs, events, and assets; signed download URLs require owner authorization and short expiry.
- Keep all currency arithmetic in integer cents; enforce spend+reservation <= budget.
- Verify provider charges against actual invoices/usage records before calling them final.

## Release gate
Choose production database, deploy migration through review, implement transactional repository and worker, validate concurrency/restart recovery, then run security tests. No real DB, cloud storage, or API calls have been made.
