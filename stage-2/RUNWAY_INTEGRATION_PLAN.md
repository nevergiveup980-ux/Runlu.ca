# Runway API integration — safe staged plan

Documentation: https://docs.dev.runwayml.com/ and https://docs.dev.runwayml.com/assets/outputs/

1. Internal-only adapter first; never expose API key in frontend or git.
2. Create task using official SDK with a server-side key after spending approval.
3. Persist provider task ID before waiting; poll task states with rate limiting/backoff.
4. On SUCCEEDED, immediately ingest the temporary output into private object storage. Official docs warn output links expire in 24–48 hours; do not serve them directly to customers.
5. Verify downloaded bytes: media format, duration, codec, dimensions, decodability, content quality, and rights.
6. Reconcile charges against provider usage records. Timeouts and unknown billing require manual/automatic reconciliation before retry.
7. Expose only sanitized status and signed short-lived URLs for validated final assets.
8. Add durable queue, auth, per-user limits, idempotency, cancellation, content moderation, retention, and payment controls before launch.

Current implementation: pure response-normalization helper only. No network calls, API credentials, provider spending, storage, or verified video generation.
