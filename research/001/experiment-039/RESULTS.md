# E039 — Exact Robust Static Result

Across the three admitted synthetic workloads, exhaustive search over every contiguous 2-bit / four-bucket codebook gives:

**Robust minimax cuts: [3, 7, 12]**

Regret by workload:
- Uniform: 0.171875
- Low-heavy: 0.194625
- Burst-heavy: 0.173444
- Worst case: 0.194625

For comparison, the workload-specialized codebooks have these worst-case regrets:
- U-trained [4,8,12]: 0.283187
- L-trained [2,4,7]: 0.492188
- B-trained [3,8,14]: 0.234375

## Interpretation
The robust codebook sacrifices some per-workload optimality to reduce worst-case exposure across workload drift. This gives a legitimate alternative to frequent codebook switching.

No universal preference between robust-static and adaptive switching is established; that depends on switching cost, workload persistence and estimation uncertainty.
