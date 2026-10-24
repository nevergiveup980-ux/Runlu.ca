# PostgreSQL execution checkpoint

Migration 002_attempts.sql is a development draft, not deployed.

Next implementation requirements: owner-scoped idempotent submission, atomic queue claims with SELECT FOR UPDATE SKIP LOCKED, budget reservation in integer cents, attempt records and settlement in one transaction, lease recovery, and provider-billing reconciliation. All user values must be SQL parameters. Do not retry an uncertain external API call until its status is reconciled.

Do not expose production database or customer records until authentication, RLS, tests against real PostgreSQL, and worker recovery are implemented.
