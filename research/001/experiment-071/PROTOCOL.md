# Experiment 071 — Numeric Context Integrity

## Purpose
E070 verifies arithmetic lineage. E071 tests whether an arithmetically correct number becomes misleading when its semantic context is stripped.

## Numeric context tuple
VALUE
UNIT
DENOMINATOR
BASELINE
POPULATION
WINDOW

Optional but often required:
METRIC
CONDITIONING_EVENT
SCOPE

## Rule
Arithmetic correctness and context completeness are separate gates.

PASS_ARITHMETIC + FAIL_CONTEXT = CONTEXT_REVIEW.

A percentage without its denominator/baseline is not automatically false, but it is not sufficiently specified for a headline comparison when those fields determine interpretation.
