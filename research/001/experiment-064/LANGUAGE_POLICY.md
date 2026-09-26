# E064 — Claim Language Policy

Every generated research summary should carry an explicit evidence scope before language linting.

Use REVIEW_REQUIRED for detected scope overreach.

Do not automatically weaken or strengthen prose without preserving the original claim for audit.

Do not treat absence of a phrase match as approval.

## Safe publication workflow
1. determine claim scope from E063-style evidence graph;
2. lint proposed wording;
3. inspect every flagged phrase;
4. human approves final wording;
5. retain scope tag and claim-ledger reference.

## Next drill — E065
Regex catches explicit overreach but misses implication.

Build paired paraphrase tests:
- explicit overclaim;
- subtle implied overclaim;
- properly bounded wording.

Then define a small semantic review checklist rather than pretending regex can understand scientific scope.
