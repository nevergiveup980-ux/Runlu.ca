# Experiment 018 — Research Direction Audit

## Original hypothesis
A pre-agreed correlation policy may reduce dangerous disagreement between autonomous agents with incomplete private observations when timely communication is unavailable.

## Audit question
Which experiments still test that hypothesis, and which became a separate communication/safety-engineering branch?

## Lineage
- E001–E005: direct correlation-policy / classical-control investigation.
- E006: Bell/CHSH sanity benchmark; scientific control, not warehouse evidence.
- E007: synthetic CHSH-to-warehouse analogy.
- E008: warehouse-native game extraction.
- E009–E010: information/communication resource comparison.
- E011–E017: reliability, integrity, freshness, reset, recovery, and trust architecture.

## Finding
E011–E017 are useful engineering research, but they no longer directly test the original no-communication correlation hypothesis. They study what happens once ordinary communication is permitted and must be trusted.

Therefore Research 001 has forked into two legitimate but distinct questions:

A. FALLBACK CORRELATION LANE
When communication is unavailable, can pre-agreed/shared classical correlation improve the safety-throughput frontier beyond appropriately matched classical baselines?

B. TRUSTED COMMUNICATION LANE
When a small communication channel exists, what information and trust semantics are sufficient for safe coordination under faults and resets?

These lanes must not be merged when drawing conclusions.
