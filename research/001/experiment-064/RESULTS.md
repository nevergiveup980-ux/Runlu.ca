# E064 — Claim-Language Linter Result

The linter is tested against bounded and overreaching synthetic sentences.

Declared SYNTHETIC sentence:
"In this synthetic audit, the three exponential variants are structurally redundant."

Result:
NO_SCOPE_OVERREACH_DETECTED.

Declared SYNTHETIC sentence:
"This proves a real-world operational benefit."

Result:
REVIEW_REQUIRED.

Declared SYNTHETIC sentence:
"The policy is safe for production."

Result:
REVIEW_REQUIRED.

An OBSERVATIONAL sentence using "observed in warehouse data" is not flagged when the declared scope is OBSERVATIONAL.

An OPERATIONAL sentence using "improves warehouse operations" is not flagged when the declared scope is OPERATIONAL.

## Critical limitation

NO_SCOPE_OVERREACH_DETECTED does not mean "scientifically valid".

The linter recognizes conservative phrase classes only. It can miss paraphrases, sarcasm, implication, or domain-specific overstatement.

Therefore its output is a review trigger, never an autonomous publication decision.
