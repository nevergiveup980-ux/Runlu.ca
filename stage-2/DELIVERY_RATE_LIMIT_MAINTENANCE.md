# STAGE 2.0 private delivery limiter maintenance

Run `runDeliveryRateLimitMaintenance` from a **trusted server-side scheduler** with a private PostgreSQL pool. Do not expose it as a public HTTP route and do not run it from the browser.

Recommended initial cadence: every 5 minutes, with `windowMs` matching the deployed rate limiter and `batchSize=500`. Each invocation deletes at most one batch. If `moreMayRemain` is true, schedule additional passes with a bounded execution budget. Never loop indefinitely.

The cleanup uses `FOR UPDATE SKIP LOCKED`, so concurrent requests refreshing their counters are not blocked by maintenance. Metrics contain only success/failure, deleted count and elapsed milliseconds; **do not log rate keys, tickets or session identifiers**.

The scheduler and database credentials are intentionally not configured in this prototype branch. Production requires an authenticated scheduler, private database role, centralized metrics/alerts and explicit deployment approval. This maintenance task does not create tables: apply `005_delivery_rate_limits.sql` through an approved migration process first.

For transient failures, the optional `runDeliveryRateLimitMaintenanceWithRetry` wrapper supports 1–3 attempts per scheduler invocation (default 2). Each attempt is separately reported through `onAttempt`, without database keys or ticket contents. Exhausted attempts propagate the last error to the scheduler, which should raise an alert and retry at the next scheduled interval. The wrapper deliberately has no unbounded loop or automatic sleep; production schedulers should impose execution timeouts and avoid overlapping runs.

For a long-lived Node.js worker, `createDeliveryMaintenanceRunner` suppresses overlapping invocations **within the same process** and releases its guard even after failures. This is not a distributed lock. For multiple replicas, use a single dedicated scheduler or a PostgreSQL advisory lock/other distributed coordination before enabling scheduled cleanup in production.
