# Experiment 064 — Claim-Language Linter

## Purpose
E063 defined evidence scopes. E064 adds a conservative language audit that flags wording which appears to claim a higher scope than the evidence supports.

This is a review aid, not an automatic truth classifier.

## Supported scope tags
ANALYTIC
SYNTHETIC
OBSERVATIONAL
OPERATIONAL
PRODUCTION_SAFETY

## Rule
Each phrase class has a minimum evidence scope.

Examples:
- "in this model" -> ANALYTIC
- "in this simulation" -> SYNTHETIC
- "observed in warehouse data" -> OBSERVATIONAL
- "improves warehouse operations" -> OPERATIONAL
- "safe for production" -> PRODUCTION_SAFETY

If a sentence contains a phrase whose minimum scope exceeds the declared claim scope, flag REVIEW_REQUIRED.

No sentence is automatically rewritten into a stronger claim.
