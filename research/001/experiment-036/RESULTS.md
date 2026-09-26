# E036 — Exact Synthetic Frontier

Exact enumeration for iid uniform integer queues Q in {0,...,15} gives:

| Encoding | Payload | Optimal boundaries | Expected queue-difference regret |
|---|---:|---|---:|
| E0 fixed role | 0 bits | — | 2.656250 |
| E1 two buckets | 1 bit | 8 | 0.656250 |
| E2 four buckets | 2 bits | 4, 8, 12 | 0.156250 |
| E4 exact count | 4 bits | every integer | 0 |

For the uniform synthetic distribution, the optimal partitions are balanced contiguous buckets.

The first payload bit removes 75.29% of the zero-payload expected regret.
Two bits remove 94.12%.

## Interpretation
The frontier shows diminishing decision-regret as representation resolution increases. It does not imply these bit counts or boundaries are optimal for a real warehouse distribution.

The correct engineering question is not "how many bits can we send?" but "what is the smallest encoding that meets a declared decision-regret budget under the actual state distribution?"

## Next gate
E037 should attack the uniform-distribution assumption with skewed and burst-heavy synthetic queue distributions. Optimal thresholds may move substantially, showing that encoding must be workload-aware.
