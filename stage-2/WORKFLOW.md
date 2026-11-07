# RUNLU STAGE 2.0 — simulated job lifecycle

QUEUED -> GENERATING -> COMPLETED (verified mock artifact)
                  |-> RETRYABLE_ERROR -> GENERATING
                  |-> FAILED (attempt limit or invalid billing)
                  |-> BUDGET_EXCEEDED (stop)

This module is intentionally a **test double**, not a production queue. It has no database persistence, auth, payment, cancellation, webhook validation, real media generation, or multi-worker concurrency safety. It records only provider-reported charges, not guaranteed actual bills. Production must reserve budget **before** every call and reconcile against authoritative provider billing; a provider can otherwise exceed the limit in a single attempt. Production must validate actual video bytes (codec, length, visual quality) rather than trusting provider's `verified` flag.

Run `node --test stage-2/*.test.mjs`.
