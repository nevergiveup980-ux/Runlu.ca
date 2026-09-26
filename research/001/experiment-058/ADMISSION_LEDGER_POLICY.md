# E058 — Admission Decision Ledger Policy

Every nontrivial gate judgment should record:
- gate ID;
- PASS / FAIL / UNRESOLVED;
- evidence or rationale;
- reviewer/decision version;
- what evidence would resolve an UNRESOLVED judgment.

Do not force binary certainty where the admission evidence is genuinely incomplete.

## Reporting
Report both:
- model-set robustness class;
- consensus depth range across admissible completions.

Do not assign probabilities to completions unless a separately justified probabilistic reviewer/error model exists.

## Next drill — E059
Attack a remaining weakness: simple majority can be misleading when admitted model families are near-duplicates.

Three closely related decay curves should not automatically outweigh one structurally different model merely because there are more of them.

Audit model-family dependence and define equivalence/clustering rules before counting votes.

Question: should consensus count models, or independent modeling assumptions?
