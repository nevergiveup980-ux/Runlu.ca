# E054 — Horizon Robustness Policy

Report a memory parameter together with its decision-robustness interval.

For rolling windows, derive boundaries from event ages rather than brute-force scanning arbitrary integer windows.

For exponential decay, report roots where debt changes sign and the intervals between roots.

## Example from the synthetic E053 history
Rolling:
- [5,50) -> A.

Any W inside that entire interval gives the same corrective preference.

Exponential:
- H < about 31.79 -> A;
- H > about 31.79 -> B.

A fitted H=30 with plausible uncertainty [25,40] is not decision-robust because the interval crosses the flip boundary.

## Important limitation
Decision invariance does not mean equal objective value. Two horizons may choose the same side while assigning different debt magnitudes.

## Next drill — E055
Move from parameter robustness to **model-form robustness**.

Ask whether rolling-window and exponential-decay models agree over a declared plausible parameter region.

Define a model-consensus region:
- both memory models select the same corrective side;
- neither lies near a flip boundary.

If model form changes the decision, uncertainty is structural rather than merely parametric.
