# Experiment 013 — Correlated Fault Challenge

## Purpose
Attack E012's independent-bit-error assumption and determine which minimal protections fail under correlated faults.

## Message candidates
M0 raw: [u]
M1 duplicate: [u,u]
M2 complement: [u,!u]
M3 protected tiny frame: [epoch bit, u, parity(epoch,u)]
The frame is intentionally tiny and illustrative, not a production protocol or CRC substitute.

## Fault families
F1 independent bit flips.
F2 common-mode inversion: every transmitted bit is inverted together.
F3 contiguous burst inversion of length 2 where frame length permits.
F4 stuck-at-0.
F5 stuck-at-1.
F6 replay of a previously valid frame.
F7 stale-but-valid frame with an old epoch.

## Receiver rule
Messages either decode to a value with VALID status or become INVALID and trigger SAFE-HOLD. For M3, epoch mismatch is INVALID.

## Metrics
- silent wrong logical value
- detected invalid
- false valid replay/stale acceptance
- operational conflict/deadlock/progress under the frozen E010 mapping

## Guardrail
A code that is strong against independent flips but weak against common-mode or replay faults must be reported as such. Do not summarize protection with one aggregate reliability number.
