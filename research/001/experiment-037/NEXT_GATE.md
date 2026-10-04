# E037 — Next Gate

E037 shows that payload design is workload-aware.

But optimizing thresholds once creates a new failure mode: **distribution drift**.

A codebook tuned to yesterday's workload can become suboptimal during seasonal, shift, customer, or operational changes.

E038 should freeze a codebook learned under one synthetic distribution and evaluate it under another. Compare:
- fixed historical codebook;
- oracle re-optimized codebook;
- simple monitored reconfiguration.

The key metric is excess regret caused by encoding drift. Reconfiguration itself must later be treated as a trusted versioned state change; sender and receiver cannot silently use different codebooks.
