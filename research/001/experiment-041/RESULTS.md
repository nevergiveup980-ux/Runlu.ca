# E041 — Persistence Uncertainty Result

E040's deterministic break-even N > C/DeltaR becomes an expected-value rule when persistence is uncertain.

For geometric survival:

**switch iff DeltaR/(1-s) > C_switch + U.**

This exposes three independent reasons not to reconfigure:
1. the new codebook saves too little per encounter;
2. the regime is unlikely to persist;
3. switching/uncertainty cost is too high.

## Illustrative C_switch=1, U=0 thresholds
Using E040 DeltaR values:

- Uniform, old low-heavy codebook: DeltaR=0.335938 -> require s > 0.664063.
- Uniform, old burst-heavy codebook: DeltaR=0.078125 -> require s > 0.921875.
- Uniform, old robust codebook: DeltaR=0.015625 -> require s > 0.984375.
- Low-heavy, old uniform codebook: DeltaR=0.184746 -> require s > 0.815254.
- Low-heavy, old burst-heavy codebook: DeltaR=0.131296 -> require s > 0.868704.
- Low-heavy, old robust codebook: DeltaR=0.096184 -> require s > 0.903816.
- Burst-heavy, old uniform codebook: DeltaR=0.060923 -> require s > 0.939077.
- Burst-heavy, old low-heavy codebook: DeltaR=0.275210 -> require s > 0.724790.
- Burst-heavy, old robust codebook: DeltaR=0.042959 -> require s > 0.957041.

These are algebraic illustrations in synthetic regret units only.

## Interpretation
A robust codebook creates small DeltaR relative to each specialized oracle, so switching away from it requires very persistent evidence when switching cost is material. This quantifies the anti-thrashing value observed qualitatively in E039/E040.
