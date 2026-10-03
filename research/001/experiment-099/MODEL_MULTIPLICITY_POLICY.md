# E099 — Model Multiplicity Policy

Before aggregating conclusions:
- define the candidate interaction family;
- record the admission basis for every candidate;
- exclude unjustified candidates by rule, not by result;
- freeze the admitted family before reading its aggregate verdict;
- report every admitted model's conclusion;
- classify disagreement as MODEL_SENSITIVE.

Do not:
- choose models because they support a desired conclusion;
- count near-duplicate models as independent votes;
- use majority vote as a substitute for model justification;
- silently remove inconvenient admitted models.

Statuses:
STABLE_DEPENDENT
STABLE_SEPARATE
MODEL_SENSITIVE
UNRESOLVED_FAMILY

## Next drill — E100
Model-family redundancy audit.

E099 treats admitted models as a family but deliberately does not vote. E100 should identify models that are merely reparameterizations, nested variants, or dependent descendants of one specification root.

Core question:
Does apparent model diversity collapse after model-provenance clustering?
