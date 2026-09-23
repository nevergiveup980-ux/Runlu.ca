# E047 — Interpretation Policy

E047 answers a narrower question than E046.

- E046 asks whether the sample appears structurally trustworthy enough to analyze.
- E047 asks how sensitive the calibration is to sampling variation *within that sample*.

A narrow bootstrap interval cannot rescue biased collection.
A stable threshold cannot prove the queue proxy is operationally valid.
An unstable threshold is evidence against pretending the current point estimate is settled.

## Reporting rule
When real data arrives, report together:
1. E046 sampling/integrity diagnostics;
2. E045 point estimates;
3. E047 uncertainty intervals;
4. threshold-selection frequency / stability;
5. sample size and collection coverage.

## Next drill — E048
Threshold stability can still be misleading if several neighboring codebooks have almost identical regret.

E048 should measure **near-optimal equivalence**:
- enumerate all 1-bit/2-bit codebooks;
- compute regret gap from optimum;
- report the set of codebooks within a declared epsilon/regret tolerance.

The engineering question then becomes not "which threshold won?" but "how many materially equivalent choices exist?"
