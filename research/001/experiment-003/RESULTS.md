# Experiment 003 Results

Specification: 100,000 synthetic trials; seed 20260921; private-observation accuracy 0.72.

| Policy | Complementary | Collision | Deadlock | Correct priority |
|---|---:|---:|---:|---:|
| Independent | 0.59856 | 0.20165 | 0.19979 | 0.52193 |
| Fixed role | 1.00000 | 0.00000 | 0.00000 | 0.50005 |
| Correlated tiebreak v1 | 0.50047 | 0.49953 | 0.00000 | 0.36214 |

## Finding
The first correlated complementary-action policy fails badly. It eliminates deadlock by forcing a designated mover, but conflicting private positive evidence produces excessive GO/GO collisions. It also resolves true priority less accurately than both controls.

This is a useful falsification result: a shared random variable is not sufficient for safe complementary coordination when agents cannot know the other agent's private observation.

## Consequence
Do not tune the current policy merely to recover a favorable result. Experiment 004 should change the information structure or policy class explicitly, then preregister the comparison before running it. Candidate direction: pre-agreed role-conditioned response tables that map local signal + shared correlation variable to complementary actions, evaluated against an equally expressive classical shared-random baseline.

No claim of quantum advantage is supported.
