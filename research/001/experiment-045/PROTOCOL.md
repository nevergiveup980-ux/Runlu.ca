# Experiment 045 — Offline Calibration Runner

## Purpose
Turn E044's observational schema into a reproducible research instrument that can consume an offline JSONL/CSV export and recompute the information/encoding results without any production connection.

## Hard boundary
The runner:
- reads only local files supplied on the command line;
- performs no network requests;
- has no database credentials;
- performs no Warehouse OS writes;
- emits analysis JSON only.

## Metrics
For accepted observations where `opportunity=true`:
- sample count and quality/missingness summary;
- empirical queue histograms;
- fixed-role zero-payload regret;
- exact optimal contiguous 1-bit threshold;
- exact optimal contiguous 2-bit thresholds;
- per-context 2-bit optima;
- robust-static 2-bit codebook minimizing worst-case regret across observed contexts;
- oracle headroom of context-specific encoding over the robust-static codebook.

Decision regret for selecting side S remains:
`max(qA,qB)-qS`.

Same-bucket allocation uses a fair tie-break in expectation, so regret contribution is `|qA-qB|/2`.

## Guardrail
If the observed queue proxy does not correspond to a real shared allocation opportunity, E045 output is descriptive only and must not be interpreted as operational calibration.
