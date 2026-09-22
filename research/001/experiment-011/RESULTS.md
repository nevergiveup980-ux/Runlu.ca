# Experiment 011 — Exact Reliability Findings

E011 can be solved exactly under the current independent-uniform urgency model. No Monte Carlo estimates are needed.

Let p be the probability of the tested channel fault.

## Bit flip

When the urgency bit is flipped, the frozen E010 protocol produces either both-YIELD or both-ENTER depending on A's true urgency. Therefore:

- conflict = p / 2
- deadlock = p / 2
- progress = 1 - p
- urgent-priority = 1 - p

A corrupted bit is therefore dangerous: even a small flip probability creates nonzero conflict risk.

## Missing/late message with SAFE-HOLD or FIXED-ROLE fallback

Under the preregistered A->B model these two fallbacks are behaviorally identical at B (B yields):

- conflict = 0
- deadlock = p / 2
- progress = 1 - p / 2
- urgent-priority = 1 - p / 2

This sacrifices availability/priority rather than creating collision risk.

## Missing/late message with LOCAL-URGENCY fallback

B acts on its own urgency when the message is unavailable:

- conflict = p / 4
- deadlock = p / 4
- progress = 1 - p / 2
- urgent-priority = 1

This preserves sole-urgent priority but introduces both conflict and deadlock in equal measure.

## Selected sweep points

| fault p | flip: conflict | flip: progress | safe-hold: conflict | safe-hold: progress | local-urgency: conflict | local-urgency: progress |
|---:|---:|---:|---:|---:|---:|---:|
| 0.001 | 0.0005 | 0.999 | 0 | 0.9995 | 0.00025 | 0.9995 |
| 0.01 | 0.005 | 0.99 | 0 | 0.995 | 0.0025 | 0.995 |
| 0.05 | 0.025 | 0.95 | 0 | 0.975 | 0.0125 | 0.975 |
| 0.10 | 0.05 | 0.90 | 0 | 0.95 | 0.025 | 0.95 |
| 0.20 | 0.10 | 0.80 | 0 | 0.90 | 0.05 | 0.90 |
| 0.50 | 0.25 | 0.50 | 0 | 0.75 | 0.125 | 0.75 |

## Threshold interpretation

There is no single reliability threshold without first specifying which safety constraint matters. If any nonzero conflict probability is unacceptable, corrupted-bit use is dominated on safety by fail-closed SAFE-HOLD for every p > 0. LOCAL-URGENCY likewise creates conflict for every p > 0.

The engineering distinction is therefore stronger than a single percentage threshold:

**detectable absence can fail safe; undetected corruption cannot.**

This points toward integrity/error detection and explicit validity signaling as higher-priority design requirements than raw delivery reliability alone.

## Boundary

These are exact results for the synthetic E008-E011 model, not real warehouse accident probabilities or production safety requirements. Stale-state behavior remains unmodeled pending a preregistered temporal process.
