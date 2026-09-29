# E093 — Reliability / Validity Policy

For empirical-oracle candidates, report separately:
- repeatability / within-source spread;
- inter-source agreement where multiple observers/sensors exist;
- bias relative to an independently justified reference when available;
- uncertainty of the reference itself.

Never use high agreement as a synonym for correctness.

Systematic shared bias may survive repeated measurements and multi-observer agreement.

A noisy but unbiased measurement may require aggregation/uncertainty treatment rather than rejection.

## Next drill — E094
Attack shared bias across observers.

Create multiple observers that appear independent but share one calibration reference or training label source.

Compare:
INDEPENDENT_NOISE,
SHARED_OFFSET,
MIXED_BIAS,
and truly separate calibration roots.

Question: when does inter-observer agreement merely reveal a common calibration ancestor rather than independent confirmation?
