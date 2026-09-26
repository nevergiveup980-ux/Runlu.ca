# Experiment 029 — Queue-Pressure Fallback Game

## Purpose
Test whether a zero-communication fallback mechanism can exploit private, time-varying local queue pressure beyond the full classical strategy set while safety remains invariant.

## Minimal native model
Each side privately observes one queue-pressure bit:
- 0 = LOW
- 1 = HIGH

Both sides remain safely stoppable. Exactly one side receives the next entry opportunity; the other waits.

A local deterministic policy maps its own pressure bit to REQUEST(1) or YIELD(0).

## Native efficiency objective
When queue states differ, assigning the opportunity to the HIGH side is efficient.
When states are equal, either side is equally efficient, but exactly one should move.

Define:
- conflict_request: both REQUEST;
- dual_yield: both YIELD;
- allocation_success: exactly one is selected;
- high_queue_correct: conditional probability that HIGH receives the opportunity when queue states differ.

A safe arbiter is NOT silently added: if both agents make the same fallback decision, that is a coordination failure for this zero-communication model.

## Comparators
C0 all 16 deterministic local policy pairs.
C1 arbitrary shared-classical mixtures over C0.
C2 fixed right-of-way.
C3 pre-agreed alternating roles across encounters.
C4 communication reference that knows both queue bits.

## Gate
First characterize C0/C1 exactly. Do not introduce a nonclassical resource in E029.
