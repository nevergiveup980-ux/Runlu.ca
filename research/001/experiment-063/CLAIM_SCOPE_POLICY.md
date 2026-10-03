# E063 — Claim Scope Policy

Every headline result should carry a scope tag:
- [ANALYTIC]
- [SYNTHETIC]
- [OBSERVATIONAL]
- [OPERATIONAL]
- [PRODUCTION-SAFETY]

Do not omit the tag when a reader could plausibly mistake one level for another.

## No leapfrogging
Passing L0/L1 does not waive L2.
Passing L2 does not waive controlled operational evaluation.
Operational success does not itself establish a production safety case.

## Safety boundary
Safety claims are not merely a higher-confidence version of efficiency claims. They require different evidence and governance.

## Next drill — E064
Turn the claim graph into a claim-language linter.

Given a result scope and a proposed sentence, flag phrases that overreach the evidence level:
- "proves in real operations"
- "safe for production"
- "validated in warehouse"
when only analytic/synthetic evidence exists.

Use conservative phrase classes and require human review rather than pretending natural-language classification is infallible.
