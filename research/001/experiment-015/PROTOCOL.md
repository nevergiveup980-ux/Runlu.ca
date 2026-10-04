# Experiment 015 — Reset / Replay Adversarial Test

## Purpose
Test whether freshness survives sender restart, receiver restart, state loss, and replay. A sequence counter is not considered sufficient unless its lifecycle is defined.

## Candidate schemes

S0 — volatile sequence only
- sender sequence starts at 0 after boot;
- receiver stores last_sequence only in volatile memory.

S1 — receiver-persistent sequence
- sender may restart/reset;
- receiver persists last_sequence.

S2 — session nonce + sequence
- each sender boot creates a session identifier;
- sequence is monotonic only inside that session;
- receiver binds freshness state to the active session.

S3 — persistent monotonic epoch + sequence
- sender persists a monotonic epoch across restart;
- receiver persists accepted epoch/sequence.

These are abstract state machines, not production cryptographic protocols.

## Adversarial traces
T1 normal ordered delivery
T2 duplicate current message
T3 delayed old message
T4 reordered pair
T5 sender restart then legitimate new traffic
T6 receiver restart then replay of captured old traffic
T7 both endpoints restart
T8 old-session replay after new session established
T9 state rollback from backup/snapshot
T10 counter wrap/exhaustion

## Classification
For every trace classify:
- ACCEPT_CURRENT
- REJECT_REPLAY
- REJECT_LEGITIMATE
- ACCEPT_STALE
- DESYNC / RECOVERY_REQUIRED

## Guardrail
A scheme is not called replay-safe merely because it works without restart. Restart and state rollback are part of the threat/fault model.
