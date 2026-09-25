# Startup Recovery Guard

Startup Recovery Guard protects the Local-First workspace before normal boot when the previous browser session appears to have ended abnormally or local data integrity needs review.

## Startup sequence
1. Read the prior startup-session marker.
2. If the prior session was still marked open, create a Recovery Point before normal workspace startup.
3. Mark the new session open.
4. Inspect Local Data Health, Data Version, IndexedDB availability, and local-cache / durable-mirror consistency.
5. Pause normal workspace boot only for critical conditions.
6. Never auto-rewrite business records.

## Critical conditions
- unreadable/corrupt Universal local JSON,
- workspace schema newer than the running app,
- local-cache / IndexedDB mismatch after an unclean prior exit.

A simple unclean-exit marker is a review condition, not by itself a reason to block work. IndexedDB unavailability is also a review condition unless another critical integrity condition exists.

## Clean exit
The guard records a best-effort clean-exit marker on `pagehide` and `beforeunload`. Browser or operating-system termination can prevent those events; that is precisely why a still-open marker is treated as an abnormal-exit signal rather than proof of corruption.

## Recovery
The guard does not perform automatic repair. It routes the customer to Support & Recovery, where existing Recovery Point, Backup / Restore, Durable Local, Data Health and Diagnostics tools retain their own confirmations and safeguards.
