# Experiment 046 — Calibration Integrity and Sampling-Bias Audit

## Purpose
Prevent E045 from producing precise-looking calibration from unrepresentative observations.

E046 audits the observation process before any real-data encoding result is treated as operational evidence.

## Risks
- busy-period oversampling;
- quiet-period under-sampling;
- recording only unusual/conflict-prone encounters;
- context labels that are uneven or missing;
- duplicate events;
- long unexplained observation gaps;
- manual-observation fatigue;
- exclusion of non-opportunity periods that changes the implied denominator;
- source-mode changes that coincide with workload changes.

## Principle
A low-regret codebook estimated from biased data is not a validated warehouse codebook.

E046 does not invent a universal acceptance threshold. It reports diagnostics and blocks strong interpretation when obvious integrity failures are present.
