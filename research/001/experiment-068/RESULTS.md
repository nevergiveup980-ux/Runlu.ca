# E068 — Downstream Impact Result

The fixture contains a source claim with descendants across abstract, executive summary, website, numeric table, and method note.

## Conclusion reversal
When the source metric direction reverses, ABSTRACT, EXEC, and WEBSITE are transitively dependent on that direction and are BLOCKED.

This demonstrates why checking only direct children is insufficient.

## Numeric correction
TABLE is RE_REVIEW because it depends on the numeric value.

METHOD_NOTE is UNAFFECTED because its declared dependency is the method definition, not the corrected number.

## Scope narrowing
Descendants that inherit the source scope are RE_REVIEW.

## Retraction
In the declared fixture, all descendants depend on at least one retracted source proposition and are BLOCKED.

## Core result
Impact propagation should be proposition-aware, not merely file-aware.

A source file changing does not mean every descendant is wrong; equally, a descendant several links away can still be invalidated by a changed proposition.
