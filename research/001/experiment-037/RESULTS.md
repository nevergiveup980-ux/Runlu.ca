# E037 — Exact Synthetic Results

Exact exhaustive threshold search produced:

| Workload | 0-bit regret | Best 1-bit cut | 1-bit regret | Best 2-bit cuts | 2-bit regret |
|---|---:|---|---:|---|---:|
| Uniform | 2.656250 | 8 | 0.656250 | 4/8/12 | 0.156250 |
| Low-heavy | 1.690789 | 4 | 0.437835 | 2/4/7 | 0.098441 |
| Burst-heavy | 3.154224 | 9 | 0.523662 | 3/8/14 | 0.130486 |

## Result
The optimal thresholds move materially with the workload distribution.

Therefore a fixed equal-width encoding is not generally information-efficient. Compact state summaries should be optimized against the operational distribution and regret function, then revalidated when workload changes.

This is still a synthetic result; no threshold here is proposed for deployment.
