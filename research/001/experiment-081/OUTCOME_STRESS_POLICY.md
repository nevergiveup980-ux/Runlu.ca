# E081 — Outcome-Normalized Stress Policy

When stress-model parameters have different meanings or units:

- do not rank robustness by raw epsilon/rho magnitude;
- choose a decision-relevant common outcome quantity;
- declare the outcome-impact budget and units;
- report each geometry's native parameter separately;
- retain geometry provenance and scientific justification;
- report sign changes in the common outcome space.

Outcome normalization is a comparison device, not evidence that stress models are equally plausible.

## Next drill — E082
Attack the choice of outcome quantity itself.

E081 normalizes stress using change in D. But a research program may care about several outcomes:
- mean regret;
- worst-case regret;
- tail loss;
- fairness;
- safety-envelope violations.

A geometry that looks mild under mean D may be severe in a tail metric.

Question: does the robustness conclusion survive a preregistered vector of outcome metrics rather than a single scalar normalization?
