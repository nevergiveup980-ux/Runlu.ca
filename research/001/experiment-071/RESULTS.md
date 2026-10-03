# E071 — Numeric Context Integrity Result

The fixture uses the E036 synthetic comparison:
E0 expected regret = 2.65625.
Optimal 1-bit expected regret = 0.65625.
Relative reduction is approximately 75.29%.

A fully qualified synthetic statement records the value, unit, denominator, baseline, population, window, metric, and scope.
Result: PASS_NUMERIC_CONTEXT.

"Regret improved by 75.29%."

The arithmetic can be correct while denominator, baseline, population, window, and scope are absent.
Result: CONTEXT_REVIEW.

"The 1-bit encoding reduces expected regret by 75.29% versus E0."

This restores the baseline but still omits which workload/population generated the result.
Result: CONTEXT_REVIEW.

A deliberately wrong 80% value remains NUMERIC_REVIEW even when context fields are otherwise complete.

## Core result

Arithmetic provenance is necessary but not sufficient.

A research number is interpretable only with the semantic context that determines what was measured, relative to what, over which population/window, and at what evidence scope.

## Boundary

75.29% is from the declared E036 synthetic uniform fixture, not an observed warehouse improvement.
