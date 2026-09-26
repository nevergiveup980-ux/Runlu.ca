# Experiment 038 — Encoding Drift and Codebook Versioning

## Purpose
Measure the cost of using a compact queue codebook optimized for one workload after the workload distribution changes.

All workloads remain synthetic.

## Frozen 2-bit codebooks from E037
- U: uniform-trained cuts [4,8,12]
- L: low-heavy-trained cuts [2,4,7]
- B: burst-heavy-trained cuts [3,8,14]

Each codebook is evaluated against every E037 workload. The diagonal is the workload-specific oracle optimum.

Define excess regret:
R_excess(workload,codebook)=R(workload,codebook)-R(workload,oracle).

## Protocol rule
A codebook update is a protocol-state change, not a local UI preference. Sender and receiver must agree on the same version before encoded payloads are interpreted.
