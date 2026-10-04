# E065 — Semantic Scope Review Result

The fixture contains explicit overclaims, subtle implied overclaims, and properly bounded synthetic claims.

All declared implied-overclaim fixtures are classified REVIEW_REQUIRED.

Examples:

"The results indicate that the policy is ready for deployment."

This avoids the exact E064 phrase "safe for production", but still implies DEPLOYMENT_READINESS and an unsupported VALIDATION_TRANSFER from synthetic evidence.

"These gains should carry over to day-to-day warehouse operations."

This does not say "proves real-world operational benefit", yet it transfers a synthetic gain into a real operational causal expectation.

By contrast:

"The gain appears only in the declared synthetic comparison; no warehouse operational effect has been established."

is PASS_BOUNDED in the declared fixture.

## Core result

Scope overreach is semantic, not merely lexical.

A phrase linter can be useful as a first pass, but a publication workflow needs an explicit semantic checklist.

## Boundary

The executable uses declared fixture labels to test the checklist. It is not a general semantic AI classifier and does not establish that arbitrary prose can be automatically judged correctly.
