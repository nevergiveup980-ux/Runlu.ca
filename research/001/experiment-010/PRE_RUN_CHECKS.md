# E010 Pre-Run Analytical Checks

Before using program output, verify these invariants:

- R0 has 16 policies.
- R0R has 256 equal-weight mixtures.
- R1A and R1B each have 64 policies.
- R2 has 256 joint full-state policies.
- Progress = 1 - conflict - deadlock exactly.
- Because the benchmark is symmetric under exchanging A and B, R1A and R1B should have identical attainable metric sets even if policy IDs differ.
- Full state exchange must contain at least one perfect operational policy: no conflict, no deadlock, full progress, and correct priority whenever urgency differs.

A mismatch indicates an implementation error and must be fixed before interpretation.
