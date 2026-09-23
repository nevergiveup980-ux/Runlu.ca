# E041 — Model Risk and Next Gate

The geometric survival assumption is memoryless. Real workload regimes may have duration dependence: a surge that has already lasted 30 minutes may be more or less likely to continue than a newly detected surge.

Therefore E041 does not justify estimating a single persistence probability s and treating it as universal.

The correct general rule is:

switch when expected cumulative future regret reduction, under the admitted duration model, exceeds switching cost plus uncertainty margin.

## E042
Challenge the memoryless assumption with explicit finite-duration / age-dependent regimes.

Compare:
- geometric persistence;
- short scheduled pickup window;
- long shift-linked surge;
- heavy-tailed burst.

Ask whether the optimal switch decision depends on **regime age**, not merely current regime label.
