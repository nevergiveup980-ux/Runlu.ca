#!/usr/bin/env bash
# Run against disposable Docker PostgreSQL bound to 127.0.0.1:55432.
set -Eeuo pipefail
cd "$(dirname "$0")/../.."
command -v docker >/dev/null || { echo 'BLOCKED: Docker required on local computer' >&2; exit 2; }
command -v python3 >/dev/null || { echo 'BLOCKED: Python 3 required' >&2; exit 2; }
python3 -c 'import psycopg' || { echo 'BLOCKED: install psycopg[binary]' >&2; exit 2; }
export RUNLU_MUSIC_TEST_DSN='postgresql://runlu_test:local_test_only@127.0.0.1:55432/runlu_music_test'
docker compose -f music/local-postgres/compose.yml up -d --wait
if [[ "$(docker compose -f music/local-postgres/compose.yml exec -T postgres psql -U runlu_test -d runlu_music_test -Atqc "select count(*) from pg_namespace where nspname='music_test'")" != "0" ]]; then
 echo 'BLOCKED: existing test schema; stop and delete the disposable container volume before rerunning' >&2
 exit 2
fi
docker compose -f music/local-postgres/compose.yml exec -T postgres psql -U runlu_test -d runlu_music_test -v ON_ERROR_STOP=1 < music/local-postgres/schema.sql
python3 music/local-postgres/test_concurrency.py
echo 'PASS: isolated local Docker PostgreSQL transaction tests (NOT production RPC)'
