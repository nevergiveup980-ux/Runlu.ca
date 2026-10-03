# E051 — Dynamic-State Policy

## State minimization rule
Do not store full action history if a declared objective admits a smaller sufficient state.

For the narrow E051 equal-share fairness term:
- keep a derived `fairness_balance`;
- do not require per-encounter historical logs merely to reconstruct the balance.

Operational/audit logs may exist for other reasons, but they are not justified by this research objective alone.

## Semantic binding
A fairness balance is meaningless without its target definition.

For example:
- equal-share fairness;
- 60/40 weighted fairness;
- demand-normalized fairness

produce different meanings for the same raw service counts.

Therefore the fairness target/version is part of protocol semantics and must be versioned.

## Boundary
E051 remains observational/modeling work. It does not modify Warehouse OS scheduling or service priority.

## Next drill — E052
Attack the scalar fairness balance.

Construct cases where the same raw service balance D implies different fair actions because offered demand differs between A and B.

Compare:
- raw equal-share balance;
- demand-normalized service debt;
- opportunity-normalized fairness.

Question: is fairness a property of service counts, or of service relative to demand/opportunity?
