# E028 — Boundary

Queue pressure is admitted only as an efficiency variable.

Example interpretation:
- A observes its local queue length qA.
- B observes qB.
- Both can safely WAIT.
- Exactly one is granted the next safe entry opportunity.
- Choosing the side with greater marginal delay reduction is more efficient.

No collision-risk tradeoff is introduced.

A pre-agreed alternating schedule remains the mandatory zero-communication baseline. A communication-enabled reference may exchange queue information, but that belongs to the separate information-value comparison.

E029 must determine whether zero-communication shared classical correlation can exploit private queue information beyond the full local/randomized-classical strategy set. No nonclassical model is permitted before that audit.
