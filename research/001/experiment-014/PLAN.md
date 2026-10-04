# Experiment 014 — Minimal Trustworthy Message Envelope

## Goal
Determine the smallest *conceptual* message envelope that represents the four required properties: payload, integrity, freshness, and context/source binding.

## Candidate abstract frame
- protocol/version identifier
- sender/receiver or lane-context identifier
- sequence/epoch counter
- one-bit urgency payload
- integrity tag/check value
- explicit validity/timeout rule

This is an abstract safety-research model, not a production wire format.

## Tests
Inject:
- random corruption;
- correlated burst corruption;
- replay;
- reorder;
- duplication;
- loss;
- delay;
- wrong-context delivery;
- sender reset / sequence rollback;
- receiver reset / lost synchronization.

## Comparison
Compare raw bit, E012 tiny codes, E013 parity+epoch, and the abstract envelope by fault coverage rather than by one aggregate score.

## Non-goal
Do not optimize byte count yet. First establish which semantic fields are indispensable; compression comes later.
