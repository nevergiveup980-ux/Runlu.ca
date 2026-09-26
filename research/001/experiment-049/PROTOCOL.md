# Experiment 049 — Loss-Function Sensitivity and Objective Identifiability

## Purpose
Audit whether the preferred compact queue encoding depends more on the chosen loss function than on threshold estimation.

E049 also asks a prior question: can the desired loss function actually be identified from the E044 telemetry schema?

## Losses identifiable from E044 v1 queue snapshots
L1 LINEAR_GAP:
wrong-side loss = |qA-qB|.

L2 CAPPED_GAP(K):
wrong-side loss = min(|qA-qB|, K).

L3 HIGH_QUEUE_WEIGHTED(H,M):
wrong-side loss = |qA-qB| * M when max(qA,qB) >= H, otherwise |qA-qB|.

L3 is only a queue-level weighting proxy. It must not be called a measured starvation or delay loss.

For same-bucket fair tie-breaking, expected loss is one half of the wrong-side loss.

## Not identifiable from E044 v1
TRUE_DELAY_WEIGHTED loss requires waiting-time/age information.
TRUE_STARVATION loss requires temporal service history or an age/state measure.

A single queue-count snapshot cannot distinguish:
- a newly formed queue of 10;
- a queue of 10 containing work that has waited a long time.

Therefore E049 refuses to relabel queue count as starvation or delay.

## Decision rule
If materially different plausible identifiable loss functions produce materially different codebooks, objective specification is unresolved and threshold selection must not be treated as settled.
