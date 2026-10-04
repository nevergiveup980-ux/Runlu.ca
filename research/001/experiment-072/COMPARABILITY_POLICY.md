# E072 — Comparability Policy

Before placing two research numbers side by side as a comparison, require:
- SAME_METRIC;
- COMPATIBLE_DENOMINATOR;
- COMPATIBLE_POPULATION;
- COMPATIBLE_WINDOW;
- COMPATIBLE_SCOPE.

If any mandatory dimension is false, label NOT_COMPARABLE.

If any mandatory dimension is unknown, label REVIEW_REQUIRED.

Do not silently normalize unlike quantities into apparent comparability.

A legitimate conversion or standardization must be explicit, reproducible, and create a new derived claim with numeric lineage.

## Next drill — E073
Attack aggregation.

Even comparable subgroup numbers can produce a misleading overall comparison when group weights differ.

Build a Simpson's-paradox fixture:
- subgroup comparisons;
- pooled comparison;
- population weights;
- aggregation rule.

Question: can every subgroup point one way while the pooled headline points the other way?
