# E043 — Exact Oracle Headroom from Robust Static

Using E037–E039 exact synthetic regrets:

| Workload | Robust [3,7,12] | Oracle specialized | Maximum per-encounter oracle headroom |
|---|---:|---:|---:|
| Uniform | 0.171875 | 0.156250 | 0.015625 |
| Low-heavy | 0.194625 | 0.098441 | 0.096184 |
| Burst-heavy | 0.173444 | 0.130486 | 0.042959 |

## Key result
These gaps are the *maximum* adaptation value available before paying any detection, estimation, synchronization, transition, or rollback cost.

Therefore:
- Uniform episodes offer very little headroom over robust static.
- Low-heavy episodes offer the largest synthetic headroom.
- Burst-heavy episodes are intermediate.

Any realistic adaptive mechanism whose amortized overhead exceeds the relevant headroom cannot outperform robust static on regret accounting, even with otherwise perfect implementation.

This is a useful engineering bound: evaluate complexity against available value before building the complexity.
