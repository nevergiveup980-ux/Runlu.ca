# E077 — Joint Uncertainty Policy

When an overall contrast depends on multiple uncertain inputs:

- declare all uncertainty dimensions before evaluating the headline;
- propagate them jointly;
- use exact corner evaluation when the function and rectangular set justify it;
- otherwise use a mathematically justified global method;
- do not combine separate one-at-a-time robustness claims into a joint robustness claim;
- report SIGN_UNRESOLVED whenever the admissible set contains opposite signs.

A box is a modeling choice. Correlated inputs may require a non-rectangular feasible set; blindly taking a Cartesian product can be too conservative or physically impossible.

## Next drill — E078
Attack dependence between uncertain inputs.

E077 assumes every combination inside the rectangular box is admissible. But target mix and subgroup effects may be correlated.

Compare:
1. Cartesian box;
2. constrained feasible set;
3. impossible corners removed.

Question: can ignoring dependence create false uncertainty, or conversely can an unjustified dependence assumption hide a real sign reversal?
