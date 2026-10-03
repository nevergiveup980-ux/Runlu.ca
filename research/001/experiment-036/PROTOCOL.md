# Experiment 036 — Payload vs Decision-Regret Frontier

## Purpose
Compare queue-state encodings by the amount of task-relevant information they preserve, not by raw state reconstruction.

This is a synthetic information-design experiment. No warehouse calibration is claimed.

## Synthetic state model
Each side has integer queue Q in {0,...,15}, independently uniform for the first audit.

Full-information allocation:
- larger Q receives the next opportunity;
- ties use a fixed fair tie rule and incur zero queue-difference regret.

Decision regret for choosing side S is the queue difference lost relative to choosing the larger queue:
R = max(Q_A,Q_B) - Q_S.
Thus wrong choices on large imbalances cost more than wrong choices on near ties.

## Encodings
E0 — 0 bits: no queue payload; fixed/pre-agreed role.
E1 — 1 bit: two contiguous buckets.
E2 — 2 bits: four contiguous buckets.
E4 — 4 bits: exact Q in 0..15.

For E1/E2, thresholds are optimized exhaustively over all contiguous partitions, not hand-picked.

When encoded buckets differ, select the side with the higher bucket.
When buckets tie, use a fair role-independent tie-break; expected regret in a tied bucket equals half the absolute queue difference.

## Outputs
- minimum expected regret for each payload;
- optimal bucket boundaries;
- marginal regret reduction per added payload bit.

Aging, transport faults and trust overhead are excluded from E036 and must be layered later.
