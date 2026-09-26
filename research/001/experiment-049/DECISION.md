# E049 — Decision

E049 produces two conclusions.

## 1. Threshold robustness must include objective robustness
A threshold can be statistically stable under E047 and still be unstable to a plausible change in the loss function.

## 2. E044 v1 is insufficient for true starvation/delay objectives
Queue count alone cannot identify waiting age or service starvation.

Do not silently redefine:
- "large queue" as "starved queue";
- "high queue" as "long delay."

## Next drill — E050
Define the **minimum temporal telemetry augmentation** needed to evaluate waiting-time-sensitive objectives without collecting unnecessary personal/order data.

Candidate aggregate fields:
- oldest_wait_seconds_A/B;
- optional queue_wait_sum_seconds_A/B or coarse age bucket;
- observation timestamp already present.

E050 must test whether one aggregate age statistic is enough, or whether materially different queue-age distributions can share the same count + oldest age and still imply different decisions.
