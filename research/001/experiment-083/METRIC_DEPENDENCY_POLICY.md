# E083 — Metric Dependency Policy

For every reported metric vector:

- declare metric family and objective;
- identify shared data sources;
- identify deterministic or mathematical relationships;
- distinguish descriptive richness from independent evidence;
- do not count several summaries of one distribution as independent replications;
- keep distinct objectives separate;
- keep protected constraints non-compensatory.

Empirical correlation alone does not prove two metrics are the same objective, and low correlation does not prove scientific independence.

## Next drill — E084
Attack replication itself.

Even if two studies use distinct metric families, they may reuse:
- the same scenarios;
- the same simulator;
- the same random seeds;
- the same preprocessing;
- the same modeling assumptions.

Build an Evidence Independence Graph across experiments, not just metrics.

Question: when do E001B results represent genuine replication versus repeated analysis of the same synthetic evidence base?
