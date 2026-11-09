# Local PostgreSQL transaction tests (NOT executed yet)

This fixture is **not** RUNLU's production schema. It models atomic
reservation and rollback using a disposable local PostgreSQL database.
It never contacts Supabase, Stripe or Lyria.

## Requirements
- PostgreSQL installed and running **on your own computer** (no cloud instance)
- Python 3.10+ and `pip install "psycopg[binary]>=3,<4"`
- `psql` client

## Setup (terminal)
```bash
createdb runlu_music_test
export RUNLU_MUSIC_TEST_DSN='postgresql://localhost/runlu_music_test'
bash music/local-postgres/run-local.sh
```

If local authentication requires a user/password, configure your local
PostgreSQL role or use a local-only connection URI. Do not commit credentials.

Expected output:
```
PASS: concurrent last-credit race, same-key replay, payload collision, rollback, empty wallet (LOCAL PostgreSQL)\nPASS: local PostgreSQL fixture completed. This does not validate production RPC or Supabase RLS.
```

## Interpretation
- Uses **two separate real PostgreSQL connections** to race for the last credit.
- Verifies simultaneous same-key replay, payload collision, empty-wallet rejection, and injected insert-failure rollback.
- Does **not** test Supabase Auth/RLS, existing RUNLU credit RPC, payment
  provider, or production concurrency behavior.
- Test users are random UUIDs and the schema is isolated as `music_test`.
- Re-running the script creates new random test rows. Delete only the
  disposable local database when done.
- The test harness refuses non-local database hosts and database names
  other than `runlu_music_test`.

## Current execution status
Prepared and committed. The assistant runtime did not have PostgreSQL
binaries or Docker, and package installation timed out; therefore no
PostgreSQL tests were run here. Never mark this gate passed until an actual
local test log has been reviewed.

## Guardrails
The runner refuses remote database hosts, any database name other than
`runlu_music_test`, and pre-existing `music_test` schemas. It does not
create, delete, or reset a database automatically. Create a fresh local
database before each execution; never paste a production connection string.

Security note: connection URI query parameters are rejected, including potential `hostaddr` overrides that could redirect a nominal `localhost` connection to a remote server.
