# E015 — Pre-Run Structural Findings

Several failures follow from the state model before simulation.

## S0 volatile sequence only
Receiver restart erases replay memory. Previously captured traffic can become apparently fresh again. Sender restart also creates sequence ambiguity.

**Conclusion:** sequence-only freshness with volatile state is not restart-safe.

## S1 persistent receiver sequence
Receiver persistence closes one replay window but sender reset can make legitimate post-restart messages look old indefinitely until a resynchronization rule intervenes.

**Conclusion:** persistence on one side moves the failure; it does not solve session identity.

## S2 session nonce + sequence
A new session identifier distinguishes post-restart traffic from old-session traffic, but the receiver needs a trustworthy rule for accepting a new session. If arbitrary new session IDs are accepted without source/authentication binding, freshness can be reset by an impostor or corrupted state.

**Conclusion:** session identity needs authenticated/context-bound establishment.

## S3 persistent monotonic epoch + sequence
This can order sessions across restart if monotonic state truly cannot roll back. Snapshot restore, storage rollback, counter exhaustion, or cloning can violate that assumption.

**Conclusion:** monotonicity itself becomes a protected state dependency.

## General result
Freshness is not a property of a message field alone. It is a property of the message **plus receiver state plus session-establishment/recovery rules**.
