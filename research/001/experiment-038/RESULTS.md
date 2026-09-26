# E038 — Exact Cross-Workload Drift Matrix

Expected queue-difference regret:

| Current workload | Uniform codebook 4/8/12 | Low-heavy codebook 2/4/7 | Burst-heavy codebook 3/8/14 | Oracle |
|---|---:|---:|---:|---:|
| uniform | 0.156250 | 0.492188 | 0.234375 | 0.156250 |
| lowHeavy | 0.283187 | 0.098441 | 0.229737 | 0.098441 |
| burstHeavy | 0.191408 | 0.405696 | 0.130486 | 0.130486 |

## Excess regret examples
- lowHeavy codebook on uniform: +0.335938 over oracle.
- burstHeavy codebook on uniform: +0.078125 over oracle.
- uniform codebook on lowHeavy: +0.184746 over oracle.
- burstHeavy codebook on lowHeavy: +0.131296 over oracle.
- uniform codebook on burstHeavy: +0.060923 over oracle.
- lowHeavy codebook on burstHeavy: +0.275210 over oracle.

## Result
A codebook that is optimal under one workload can become measurably suboptimal after distribution shift. The penalty is not symmetric: moving from one workload to another can hurt differently depending on which historical codebook is frozen.

Therefore compact encoding needs drift monitoring or a deliberately robust static codebook; one-time optimization is insufficient.
