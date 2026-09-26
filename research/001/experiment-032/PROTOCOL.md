# Experiment 032 — Decision Value as Queue Information Ages

## Purpose
Attack E031's strongest assumption: the one-bit queue report is current.

Separate transport correctness from semantic freshness.

## Dynamic queue model
For the first exact audit, each side's binary queue state evolves as a symmetric two-state Markov process.

Between observation and use, a reported bit flips with probability p:
- with probability 1-p, the old bit still equals the current state;
- with probability p, it no longer does.

B's own current qB is observed locally without age. A's report qA_old is received intact but may be stale.

The allocator compares qA_old with current qB:
- if different, allocate to the reported HIGH side;
- if equal, use a fair pre-agreed tie-break independent of the hidden current qA.

## Metric
Queue-choice regret is 1 only when current qA != current qB and the LOW side is selected; otherwise 0.

This experiment studies semantic aging only. Bit corruption, loss, authentication and replay are separate dimensions.
