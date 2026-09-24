# E060 — Dependency Graph Policy

Assumption features must be defined before inspecting whether their resulting similarity helps a preferred action.

Every model must disclose the same feature vocabulary.

Do not create ultra-specific features merely to make related models appear independent.

Report:
- raw model count;
- hard-family grouping;
- assumption-feature sets;
- pairwise similarity matrix;
- effective diversity;
- action-specific effective diversity.

Do not use effective diversity alone to select A or B.

## Next drill — E061
Attack the assumption vocabulary.

Because Jaccard dependence changes when features are split, merged, or omitted, run a vocabulary sensitivity audit.

Compare multiple preregistered reasonable vocabularies and ask whether the qualitative diversity conclusion survives.

If not, label dependency inference VOCABULARY_SENSITIVE.
