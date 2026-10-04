# E015 — Fail-Closed Recovery Principle

When freshness state is ambiguous after restart, rollback, or synchronization loss, the benchmark enters:

**RECOVERY_REQUIRED -> SAFE-HOLD**

Normal coordination resumes only after a separately defined resynchronization condition succeeds.

This deliberately trades availability for safety. E015 does not yet choose a recovery mechanism; the next experiment should compare recovery designs and expose the trust assumptions each one adds.
