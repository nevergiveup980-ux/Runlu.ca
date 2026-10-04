# E006-D — Explicit Bell Measurement Simulation

This implementation no longer draws wins from a Bernoulli distribution whose probability is set to the known CHSH answer.

Instead it:
1. samples independent uniform CHSH inputs x and y;
2. selects the corresponding local measurement angles;
3. computes the ideal |Phi+> equal-outcome probability from the angle difference;
4. samples unbiased local output a and the correlated output b;
5. evaluates the CHSH win condition from the generated outputs;
6. independently estimates the four correlators and CHSH S.

Expected large-N behavior:
- win rate -> cos²(pi/8) ≈ 0.853553
- S -> 2√2 ≈ 2.828427

This is still a software simulation using the ideal quantum probability law. It is not a physical Bell test and cannot demonstrate physical nonlocality.
