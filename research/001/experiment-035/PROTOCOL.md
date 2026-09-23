# Experiment 035 — Encoding Resolution vs Semantic Freshness

## Purpose
Determine whether apparent staleness is caused by message age or by compressing queue state into an overly coarse LOW/HIGH bit.

## Underlying state
Let Q be the actual nonnegative integer queue length.

Compare three representations:
- E1: one bit, LOW/HIGH using threshold H;
- E2: small ordinal code, e.g. EMPTY / LOW / MEDIUM / HIGH;
- E3: exact or capped queue count.

The allocation objective remains: when the two sides differ materially in queue cost, prefer the side with greater marginal delay reduction. Safety remains invariant and separate.

## Key distinction
Representation error exists even at age t=0.
A perfectly fresh message can still be decision-insufficient because multiple materially different queue states map to the same code.

Total decision error must therefore separate:
1. quantization/encoding loss at observation time;
2. semantic aging after observation;
3. transport/trust failures.

## No numerical thresholds
H and ordinal bucket boundaries are not chosen in E035. They require an explicit queue-cost model or data.
