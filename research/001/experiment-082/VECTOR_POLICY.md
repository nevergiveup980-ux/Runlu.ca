# E082 — Multi-Metric Policy

Before stress evaluation:

- preregister the outcome vector;
- define each metric and denominator;
- declare metric-specific bounds and direction;
- identify protected metrics that cannot be compensated by gains elsewhere;
- keep safety-envelope metrics in their separate governance lane;
- report every failed component, not only an aggregate score.

A weighted scalar may be reported only as an additional declared estimand; it does not erase component failures.

## Next drill — E083
Attack metric dependence and redundancy.

Mean, tail, and worst-case loss may be strongly dependent summaries of the same underlying loss distribution. Counting each as independent evidence can create pseudo-confirmation.

Build a metric dependency graph and distinguish:
- distinct objectives;
- correlated summaries;
- mathematically nested metrics;
- protected constraints.

Question: how many genuinely independent dimensions of robustness are being tested?
