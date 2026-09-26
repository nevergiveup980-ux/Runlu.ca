# Experiment 012 — Integrity-Protected Minimal Channel

## Purpose
Test whether small amounts of redundancy can convert silent corruption of the E010 urgency message into detectable failure that can safely fall back to HOLD.

## Channel model
Each transmitted physical bit flips independently with probability e. Compare four encodings of one logical urgency bit.

### C0 — raw
Transmit u.

### C1 — duplication
Transmit uu. Accept only 00 or 11; 01/10 are INVALID. On INVALID, receiver SAFE-HOLDs.

### C2 — triple repetition
Transmit uuu. Majority decode. This corrects one flipped bit but can silently decode incorrectly after two or three flips.

### C3 — complement pair
Transmit u, NOT(u). Accept only 01 or 10; 00/11 are INVALID. On INVALID, SAFE-HOLD.

C1 and C3 have the same ideal independent-bit-error detection capability but are kept separate because implementation fault modes may differ later.

## Metrics
For each code and physical bit error rate e:
- correct decode probability
- detected-invalid probability
- silent wrong-decode probability
- resulting conflict
- deadlock
- progress
- urgent-priority satisfaction
- physical bits per logical urgency bit

## Sweep
e = 1e-6, 1e-5, 1e-4, 1e-3, 0.01, 0.05, 0.10, 0.20.

## Decision principle
Prioritize reduction of silent wrong-decode probability. Detected invalid messages enter SAFE-HOLD and are treated as availability loss rather than trusted misinformation.

## Scope
Synthetic independent-bit-flip model only. It does not cover burst errors, common-mode faults, malicious corruption, RF interference, timing faults, or stale messages.
