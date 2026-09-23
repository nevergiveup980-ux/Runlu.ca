# E044 — Collection and Calibration Plan

Phase 0: use a small manual or offline read-only sample; do not alter Warehouse OS.

Phase 1: validate that side_a_queue and side_b_queue map to a real allocation decision. If not, stop and redefine the proxy.

Phase 2: compute empirical queue distribution, queue-difference distribution, zero-payload regret, exhaustive 1-bit/2-bit frontiers, and robust-static candidate.

Phase 3: only with enough timestamped coverage, study drift and regime duration with uncertainty.

Phase 4: revisit E043. If robust static meets the declared target, stop adaptation work.

No fake universal sample-size threshold: report count, coverage, missingness and uncertainty.