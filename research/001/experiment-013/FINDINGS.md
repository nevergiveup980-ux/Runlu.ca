# Experiment 013 — Adversarial Fault Findings

## Classification rule
For each injected fault:
- SAFE VALID: receiver accepts the intended current logical value.
- DETECTED INVALID: receiver rejects and SAFE-HOLD is available.
- SILENT WRONG: receiver accepts the opposite logical value.
- STALE ACCEPTED: receiver accepts an old/replayed logical value as current.

## Structural findings

### M0 raw bit
Provides no integrity or freshness information. Any inversion is a silent wrong value. Stuck faults can silently agree or disagree depending on the source bit. Replay/staleness is intrinsically undetectable.

### M1 duplicate [u,u]
Single unequal-bit corruption is detectable, but common-mode inversion maps a valid codeword to the other valid codeword:
00 <-> 11.
Therefore correlated two-bit corruption is SILENT WRONG.
It also has no freshness protection.

### M2 complement [u,!u]
Single-bit corruption is detectable, but common-mode inversion also maps one valid codeword to the other:
01 <-> 10.
Therefore correlated two-bit corruption is SILENT WRONG.
It also has no freshness protection.

### M3 [epoch,u,parity]
This adds two distinct protections:
- parity rejects every odd number of bit flips;
- expected epoch rejects frames carrying the opposite epoch.

But it is not sufficient:
- some two-bit corruptions preserve parity;
- a one-bit epoch wraps after two epochs;
- a coordinated corruption can alter epoch/data/parity into another valid frame;
- replay within the same epoch remains possible;
- epoch validation requires synchronized receiver state, creating a new state-management failure mode.

## Main falsification

E012's duplicate/complement schemes are **not adequate general integrity mechanisms**. Their O(e²) silent-error result depends on independent flips and collapses under correlated codeword-to-codeword faults.

The tiny M3 frame improves fault coverage but does not establish a safety-grade protocol.

## Design consequence

A realistic next layer must separate four properties that E012 partly conflated:

1. **Integrity** — was the payload altered?
2. **Freshness** — is this message current rather than replayed/stale?
3. **Authenticity/source binding** — did it come from the expected peer/context?
4. **Availability/fail-safe behavior** — what happens when validation fails?

No single small parity trick supplies all four.

## Research status
The "two bits may be enough to protect one bit" idea is falsified as a general engineering claim. It remains true only inside the narrow independent-bit-error model of E012.
