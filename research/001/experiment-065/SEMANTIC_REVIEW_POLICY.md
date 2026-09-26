# E065 — Semantic Review Policy

For every headline sentence, ask:

1. Does it transfer a model/synthetic result to reality?
2. Does it imply deployment readiness?
3. Does it imply real safety assurance?
4. Does it use validation/proof language without naming the validation domain?
5. Does it imply a real causal effect not established by the evidence?
6. Has a necessary scope qualifier disappeared?

Any YES -> REVIEW_REQUIRED.

A reviewer should then either:
- narrow the sentence to the supported scope; or
- cite the missing higher-level evidence if it genuinely exists.

Do not automatically rewrite a flagged claim in a way that changes its scientific meaning.

## Next drill — E066
Attack qualifier laundering across summaries.

A careful technical result may say "in this synthetic fixture", while an executive summary, website card, abstract, or headline silently drops that qualifier.

Build a claim-provenance chain and verify that scope cannot become broader as text is compressed.
