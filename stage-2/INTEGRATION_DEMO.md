# Offline integration demonstration

Run `node --test stage-2/integration-demo.test.mjs` from the repository root.

The test exercises validation -> budget reservation -> deterministic mock provider -> billing reconciliation -> simulated artifact. It is deliberately **not** an actual MP4 generation, real PostgreSQL integration, or proof of supplier billing.

The database modules remain separate draft implementations. Next milestone is to run their SQL against a disposable PostgreSQL database and test concurrency, crash recovery and idempotent submission. No production credentials should be used.
