# E068 — Impact Propagation Policy

When an evidence-bearing source changes:

1. record the source claim/version and change class;
2. identify the changed proposition(s);
3. traverse all descendants;
4. compare descendant dependencies to changed propositions;
5. assign UNAFFECTED, RE_REVIEW, or BLOCK;
6. do not restore publication approval until required reviews finish.

A descendant marked UNAFFECTED should retain the reason it is independent of the changed proposition.

BLOCK is a publication-state action in this research governance model; it is not a claim that the descendant is permanently false.

## Next drill — E069
Attack hidden dependencies.

A descendant may not explicitly declare that it relies on a source proposition, yet its wording can still inherit a number, direction, scope, or conclusion.

Build dependency completeness tests:
- declared dependency;
- text-derived candidate dependency;
- mismatch -> DEPENDENCY_REVIEW.

Question: can the graph detect a child that forgot to admit what it actually depends on?
