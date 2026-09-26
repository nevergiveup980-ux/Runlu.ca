# Experiment 016 — Trust Re-Establishment After Reset

## Question
After restart, rollback, or freshness-state loss, what additional trust assumption is required before coordination may safely resume?

## Recovery candidates
R0 Blind reset: accept the first syntactically valid post-reset frame and establish a new baseline.
R1 Random session identifier: sender chooses a fresh session ID; receiver accepts a changed session and resets sequence state.
R2 Persistent monotonic epoch: sender advances durable epoch on boot; receiver accepts only epochs newer than durable receiver state.
R3 Challenge/response resynchronization: receiver issues a fresh challenge and resumes only after a response binds challenge, session/context, and payload channel.
R4 External authority recovery: a trusted controller/operator establishes a new session.

These are abstract trust/state models, not production security protocols.

## Adversarial traces
A old-session replay after receiver reset.
B sender rollback to an old snapshot.
C receiver rollback to an old snapshot.
D both sides rollback.
E delayed response from a prior recovery attempt.
F duplicated recovery message.
G wrong-context recovery message.
H session-ID collision/reuse.
I attacker/fault injects a syntactically valid new-session claim.
J authority unavailable.

## Classification
SAFE_RESUME; REPLAY_ACCEPTED; LEGITIMATE_BLOCKED; FALSE_RESYNC; RECOVERY_REQUIRED; AVAILABILITY_LOSS.

## Rule
Do not rank schemes by a single score. Record which trust assumption closes which failure and what new dependency it introduces.
