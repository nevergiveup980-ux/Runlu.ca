# Experiment 069 — Dependency Completeness Audit

## Purpose
E068 propagates changes through declared proposition dependencies. E069 attacks the assumption that descendants declare those dependencies completely.

## Method
For each descendant claim compare:
- DECLARED_DEPENDENCIES: propositions explicitly registered by the author/reviewer.
- TEXT_DERIVED_CANDIDATES: conservative candidate dependencies detectable from exact source-linked tokens or phrases.

Candidate classes:
NUMERIC_VALUE
DIRECTION
SCOPE
COMPARATOR
METHOD_DEFINITION

If a text-derived candidate is absent from the declared set, flag DEPENDENCY_REVIEW.

## Important boundary
Text-derived candidates are review prompts, not proof of semantic dependence. False positives are acceptable if visible and reviewable; silent automatic graph mutation is not.
