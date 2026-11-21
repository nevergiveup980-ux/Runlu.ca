# RUNLU STAGE recovery runbook — draft, NOT deployed

**Golden rule:** an expired worker lease is not proof that a provider job failed. Never automatically re-submit an uncertain paid task.

1. Scan expired RUNNING leases using a bounded transaction and SKIP LOCKED.
2. Transition to RECONCILIATION_REQUIRED and record an audit event.
3. Inspect unresolved stage_attempts and provider_task_id; query provider using trusted server-side credentials.
4. If a provider task is still running, resume polling rather than creating another task.
5. If finished, ingest and verify output, then reconcile billed cost.
6. If provider state is unknown, keep the job quarantined and budget reserved for manual investigation.
7. Release reservation only after verified cancellation/no-charge or authoritative billing reconciliation.
8. Ensure customer UI says 'We are checking your job' without leaking internal provider IDs or financial details.

Remaining work: persist provider task ID before or immediately after creation, safe submission idempotency, recovery state machine, automated provider lookup, authenticated admin controls, database integration tests, and alerting.
