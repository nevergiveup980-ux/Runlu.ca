# Experiment 013 — Common-Mode and Burst Error Challenge

## Motivation
E012 shows large gains for duplicate/complement integrity coding only under independent bit errors. E013 attacks that assumption.

## Planned fault families
- independent flips;
- two-bit common-mode inversion;
- burst corruption;
- stuck-at-0 / stuck-at-1;
- message replay;
- stale-but-valid message;
- loss followed by duplicate/retry ambiguity.

## Primary question
Which tiny-message protection schemes continue to convert dangerous silent corruption into detectable failure when faults are correlated rather than independent?

## Required additions
Sequence/epoch field, freshness window, stronger checksum/CRC-style detector, and explicit VALID/INVALID handling will be compared conceptually and then with a preregistered finite fault model.

No production recommendation will be made from E012 alone.
