# Experiment 066 — Claim Provenance and Qualifier Laundering

## Purpose
E065 catches semantic overreach in a sentence. E066 audits a chain of derived summaries, where a careful scope qualifier can disappear during compression.

## Principle
Compression may shorten a claim, but may not broaden its evidence scope.

Every derived claim must retain:
- source claim ID;
- declared evidence scope;
- essential qualifier(s);
- transformation purpose;
- review status.

## Fixture chain
TECHNICAL_RESULT -> ABSTRACT -> EXECUTIVE_SUMMARY -> WEBSITE_CARD.

The source evidence scope is SYNTHETIC.

A derived sentence is flagged if:
1. its declared scope outranks the source scope;
2. an essential qualifier is dropped while the remaining wording could imply broader evidence;
3. deployment/safety/real-operation language appears without a new evidence edge.

## Boundary
This is a deterministic provenance audit over declared fixtures, not a universal natural-language entailment engine.
