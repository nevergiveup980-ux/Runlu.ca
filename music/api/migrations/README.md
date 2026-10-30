# RUNLU MUSIC STUDIO — D1 schema draft

This migration is a **design artifact only**, not a deployed database migration.

## Tables
- `music_jobs`: owner-scoped generation requests, idempotency keys, status, provider job identifiers, costs, and failure diagnostics.
- `music_tracks`: saved MP3 metadata with storage key, size and SHA-256 digest.
- `music_uploads`: owner-scoped reference files with rights confirmation.

## Before use in production
1. Configure authenticated identity and enforce owner isolation in every API query; no client-controlled owner IDs.
2. Bind Cloudflare D1 database and private R2 bucket in an isolated environment.
3. Implement atomic transitions/transactions and durable queue consumers; SQL CHECK constraints alone do not enforce legal state transitions.
4. Implement private signed download flow or authenticated Worker streaming, file signatures/decoding verification and retention/deletion.
5. Document backups, quotas, provider licensing, abuse protections, consent and deletion policies.
6. Test migrations against a temporary D1 database before touching production.

Run locally only after provisioning a **development** D1 database:
`npx wrangler d1 execute <DEV_DB_NAME> --local --file=music/api/migrations/0001_music_schema.sql`

No live DB credentials, identifiers or user data are included.
