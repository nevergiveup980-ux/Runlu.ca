# Experiment 014 — Minimal Trustworthy Message Envelope

## Purpose
Determine which message semantics are indispensable before a receiver may trust a one-bit coordination payload.

## Candidate envelope
A message is modeled as:
- version/protocol ID
- context ID (lane/task)
- sender ID
- sequence number
- urgency payload
- integrity tag over all protected fields
- receiver freshness state
- timeout/deadline policy

The experiment is about semantics and fault coverage, not a production byte layout.

## Acceptance rule
Receiver accepts only if:
1. protocol/version is recognized;
2. context and sender match the expected peer/task;
3. integrity verification passes over all protected fields;
4. sequence is newer than the last accepted sequence under the preregistered ordering rule;
5. message arrives before deadline.

Otherwise status is INVALID and the operational fallback is SAFE-HOLD.

## Fault matrix
F1 payload corruption
F2 header/context corruption
F3 burst corruption
F4 replay
F5 reorder
F6 duplicate
F7 loss
F8 delay past deadline
F9 wrong-context delivery
F10 sender restart / sequence rollback
F11 receiver restart / forgotten sequence state
F12 integrity-tag corruption

## Evaluation
For each candidate field-removal ablation, classify every fault as:
- SAFE VALID
- DETECTED INVALID
- SILENT WRONG
- STALE/REPLAY ACCEPTED
- STATE DESYNC

Do not use a weighted aggregate score.
