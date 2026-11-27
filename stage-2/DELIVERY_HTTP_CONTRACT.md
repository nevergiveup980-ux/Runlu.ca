# Private Delivery HTTP Integration Contract

This is a development-only framework-neutral adapter, **not** a mounted
production route. The production HTTP host MUST:

1. Resolve `sessionOwnerId` from a verified, server-side authenticated session.
   Never accept `ownerId` or `sessionOwnerId` from the request body or headers.
2. Apply CSRF defenses to both POST routes when cookie authentication is used:
   validate Origin/Referer against a fixed allowlist and use CSRF tokens or
   an equivalent same-site protection. CORS alone does not prevent CSRF.
3. Enforce TLS, body size limits, request rate limits and per-session quotas
   before invoking the adapter. Never log raw tickets, cookies or private keys.
4. Implement `openPrivateObject` using a private bucket or protected filesystem.
   It must return a readable stream; the HTTP host must pipe with backpressure,
   handle disconnects, destroy streams on errors and avoid buffering whole videos.
5. Set Content-Type video/mp4, Content-Disposition attachment and no-store
   headers. Disable CDN caching, public object URLs and public bucket ACLs.
6. Provide a real PostgreSQL audit and revocation store, and a trusted
   `loadAssetAndJob` that rechecks current ownership, job state and asset
   verification at download time.
7. Ensure a revoked ticket cannot authorize **new** streams. A stream already
   opened before revocation may continue; if immediate termination is required,
   add active-stream cancellation and audit separately.
8. Do not treat an authorization audit event as proof of a completed transfer.
   Record separate stream start/completion/failure events if needed.

The adapter's return value is a transport-neutral response descriptor; the
HTTP host must write it to the network response. Tests use synthetic streams.
There is no real video provider or production storage integration yet.
