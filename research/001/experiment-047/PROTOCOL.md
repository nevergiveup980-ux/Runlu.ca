# Experiment 047 — Calibration Uncertainty and Threshold Stability

## Purpose
Stop small observational datasets from producing falsely precise codebook thresholds.

E047 adds deterministic bootstrap resampling to E045-style calibration. It does not turn observational data into causal or production evidence.

## Input
Offline E044 JSONL/CSV observations. Only structurally valid rows with `opportunity=true` are included in the calibration sample.

## Bootstrap
For B replicates:
1. sample N accepted observations with replacement;
2. recompute fixed-role regret;
3. recompute the exact optimal contiguous 1-bit threshold;
4. recompute the exact optimal contiguous 2-bit thresholds;
5. record the optimal regret and selected thresholds.

A seeded PRNG makes the analysis reproducible.

## Outputs
- percentile interval for fixed-role regret;
- percentile interval for optimal 1-bit regret;
- percentile interval for optimal 2-bit regret;
- threshold-selection frequency table;
- dominant threshold and its selection share;
- number of distinct optimal threshold sets observed.

## Interpretation
A point-estimate threshold is not "stable" merely because it is optimal on the original sample. Stability is evidence that nearby resamples repeatedly support the same or similar partition.

E047 intentionally avoids a universal cutoff such as "80% selection share means stable." The required stability depends on the operational consequence of choosing the wrong threshold.
