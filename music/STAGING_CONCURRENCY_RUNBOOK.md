# RUNLU MUSIC — isolated staging concurrency runbook

Status: PREPARED, NOT EXECUTED. Do not run against RUNLU's production project.

## Prerequisites
- A separate disposable PostgreSQL/Supabase staging project, verified by project ID
  and distinct from production `ekrnknlawekeoszzkamd`.
- Test-only Auth users and test-only consumable music grants.
- Music-specific plan approved and inserted **in staging only**.
- A reviewed transactional RPC combining job insertion and existing credit
  consumption. The older `atomic-credit-reservation.review.sql` uses a
  second wallet and MUST NOT be applied unchanged.
- No real Google Lyria key, Stripe live credentials or billable provider
  integration in this environment.

## Concurrency matrix
| Case | Setup | Actions | Expected invariant |
|---|---|---|---|
| Replay | one credit | submit same key/payload twice | one job, one consumption |
| Collision | one credit | submit same key/different lyrics | second rejected; one charge |
| Last credit | one credit | two connections submit distinct keys simultaneously | exactly one successful job and one consumption |
| Rollback | one credit | inject job-insert failure in transaction | zero persisted consumptions; credit unchanged |
| Insufficient | zero credits | submit new job | no job, no provider call |
| Ownership | users A and B | B requests A's job/download | not found; no signed URL |
| Timeout | one credit | fake provider returns uncertain timeout | needs_review; no automatic retry |
| Replay after zero | credit exhausted by first request | replay original key | original job returned without charge |

## Execution protocol
1. Record staging project ID, current schema revision and test run timestamp.
2. Snapshot test ledger rows and job count before running.
3. Run all tests with a fake provider and storage mock.
4. For last-credit race, use **two independent DB connections**, a barrier,
   and simultaneous commits. A sequential unit test is not sufficient.
5. Query ledger and job rows after each case; verify counts and sums, not just
   HTTP responses.
6. Capture sanitized SQL errors and test results. Do not log tokens, song
   lyrics, payment identifiers or signed URLs.
7. Drop disposable test users/grants only in staging; never run cleanup against
   production.

## Production gate
Only after the above pass: review security-definer function grants, ensure
music plan/product are distinct, implement per-account spend limits and
reconciliation, and request explicit approval before any production migration,
billing enablement or paid music generation.
