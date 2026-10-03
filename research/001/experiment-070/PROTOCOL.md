# Experiment 070 — Numeric Lineage Audit

## Purpose
Trace every published research number to source value(s) plus an explicit reproducible transformation.

## Supported transforms in this first audit
IDENTITY
PERCENT
ROUND
DIFFERENCE
RATIO
NORMALIZE

Each derived numeric claim records source IDs, source versions, transform, parameters, displayed value, and tolerance.

## Rule
Recompute the value from the registered sources. A published number passes only if the recomputed result agrees within declared tolerance and the source versions are current.

A tolerance permits presentation rounding; it does not authorize changing the underlying result.
