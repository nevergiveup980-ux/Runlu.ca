# E100 — Model-Family Redundancy Result

E100 reaches the 100th experiment node by auditing the meaning of multiplicity rather than celebrating the count.

Synthetic fixture:

- 10 admitted model instances.
- 5 declared specification roots.
- SPEC_A contains 4 variants, all DEPENDENT.
- SPEC_B contains 3 variants, all SEPARATE.
- SPEC_C contains 1 DEPENDENT model.
- SPEC_D contains 1 SEPARATE model.
- SPEC_E contains 1 DEPENDENT model.

At the raw instance level:
DEPENDENT = 7
SEPARATE = 3

At the declared root-family level:
DEPENDENT roots = 3
SEPARATE roots = 2

The raw 7-to-3 appearance is therefore not ten independent model confirmations. Four DEPENDENT instances descend from one specification root, and three SEPARATE instances descend from another.

## Core result

Model Count != Model-Provenance Diversity.

Reparameterizations, nested variants, and sibling implementations must not automatically become independent votes.

The root-level 3-to-2 split is also not a vote or probability. Root clustering removes one form of pseudo-replication; it does not prove that the five roots are mutually independent, equally plausible, or valid.

## Scope

Synthetic governance fixture only. Specification roots are declared for the fixture and do not establish empirical independence.
