# Experiment 037 — Workload-Aware Encoding

## Purpose
Challenge E036's uniform queue distribution and test whether optimal compact encodings move with workload shape.

All distributions in E037 are explicitly synthetic.

## Scenarios
- UNIFORM: E036 control.
- LOW-HEAVY: most encounters have short queues, with a decaying tail.
- BURST-HEAVY: substantial mass at very high queues, representing a deliberately stressed/bimodal workload.

Queue values remain 0..15 and the same queue-difference regret is used.

For 1-bit and 2-bit contiguous encodings, every possible threshold set is enumerated exactly for each distribution.

## Hypothesis
If compact encoding is workload-dependent, the regret-minimizing thresholds should move away from E036's balanced 8 and 4/8/12 boundaries under skewed distributions.
