# Experiment 048 — Near-Optimal Equivalence

## Purpose
Distinguish "the winning threshold changed" from "materially different decisions changed."

E047 can show unstable threshold selection under resampling. That instability may be harmless if several neighboring codebooks have nearly identical regret.

E048 enumerates every admissible contiguous 1-bit and 2-bit codebook and reports the full regret gap from the optimum.

## Inputs
Offline E044 JSONL/CSV observations and an explicitly declared absolute regret tolerance epsilon.

No universal epsilon is assumed.

## Definitions
For codebook c:

Gap(c) = R(c) - R*,

where R* is the minimum empirical regret in the same codebook class.

The epsilon-equivalent set is:

C_epsilon = { c : Gap(c) <= epsilon }.

## Outputs
- exact best codebook;
- complete ranked regret table;
- regret gap for every codebook;
- count and members of the epsilon-equivalent set;
- threshold span covered by the equivalent set;
- separation to the first codebook outside the tolerance.

## Interpretation
If many codebooks lie inside the declared tolerance, selecting the mathematically exact winner is unnecessary. Engineering may then prefer the candidate that is simpler to explain, more stable across contexts, easier to version, or less sensitive to drift.

E048 is descriptive calibration only. It does not define an acceptable operational regret budget.
