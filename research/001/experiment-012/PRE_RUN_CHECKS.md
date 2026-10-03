# E012 Pre-Run Analytical Checks

For physical independent bit-flip probability e:

- C0 silent error = e.
- C1/C3 silent error = e² and detected invalid = 2e(1-e).
- C2 majority silent error = 3e²(1-e)+e³ = 3e²-2e³.
- At sufficiently small e, C1/C3 reduce silent corruption from first order O(e) to second order O(e²), while converting most single-bit faults into detectable invalid messages.
- C2 also reduces silent corruption to O(e²), but does not expose an invalid state; its leading silent-error coefficient is 3 rather than 1.
- Under the frozen SAFE-HOLD operational mapping, conflict = silent_wrong / 2.

These are algebraic invariants. Any program output that disagrees must be treated as an implementation error.
