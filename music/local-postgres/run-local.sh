#!/usr/bin/env bash
# RUNLU MUSIC: local-only disposable PostgreSQL test runner.
set -Eeuo pipefail
cd "$(dirname "$0")/../.."
if ! command -v psql >/dev/null || ! command -v createdb >/dev/null || ! command -v python3 >/dev/null; then
  echo "BLOCKED: Install local PostgreSQL (psql + createdb) and Python 3." >&2
  exit 2
fi
if ! python3 -c 'import psycopg' >/dev/null 2>&1; then
  echo 'BLOCKED: Install local Python package: python3 -m pip install "psycopg[binary]>=3,<4"' >&2
  exit 2
fi
export RUNLU_MUSIC_TEST_DSN="${RUNLU_MUSIC_TEST_DSN:-postgresql://localhost/runlu_music_test}"
# Parse URI with Python and refuse remote hosts or wrong DB before any command.
python3 - <<'PY'
import os
from urllib.parse import urlparse
u=urlparse(os.environ['RUNLU_MUSIC_TEST_DSN'])
if u.scheme not in ('postgresql','postgres') or u.hostname not in ('localhost','127.0.0.1') or u.path!='/runlu_music_test' or u.query or u.fragment:
    raise SystemExit('BLOCKED: only local database runlu_music_test is permitted')
print('Local database target validated.')
PY
if ! psql "$RUNLU_MUSIC_TEST_DSN" -Atqc 'select 1' >/dev/null 2>&1; then
  echo "BLOCKED: Local runlu_music_test database unavailable. Create it locally: createdb runlu_music_test" >&2
  exit 2
fi
# Do not reset a database silently. Use an existing empty disposable schema only.
if [[ "$(psql "$RUNLU_MUSIC_TEST_DSN" -Atqc "select count(*) from pg_namespace where nspname='music_test'")" != "0" ]]; then
  echo "BLOCKED: music_test schema already exists. Use a fresh disposable local database." >&2
  exit 2
fi
psql "$RUNLU_MUSIC_TEST_DSN" -v ON_ERROR_STOP=1 -f music/local-postgres/schema.sql
python3 music/local-postgres/test_concurrency.py
echo "PASS: local PostgreSQL fixture completed. This does not validate production RPC or Supabase RLS."
