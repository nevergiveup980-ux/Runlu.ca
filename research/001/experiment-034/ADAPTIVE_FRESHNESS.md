# E034 — Adaptive Freshness Principle

The natural replacement for a universal TTL is a state/regime-aware freshness budget.

A receiver should ideally reason about:

P(current operational state differs from report | age, recent traffic regime/context).

This does not require machine learning. A simple implementation could use conservative operating classes such as:
- QUIET;
- NORMAL;
- SURGE;

with separately validated freshness limits.

If the regime is unknown or changes too quickly to classify reliably, the fallback should use the most conservative admitted freshness rule or SAFE-HOLD according to the surrounding safety architecture.

## New distinction
Transport metadata can prove when a message was sent.
It cannot by itself prove that the represented world state is still decision-useful.

Thus:
**timestamp freshness != semantic freshness.**

## Next drill
E035 should test threshold-crossing summaries. A one-bit LOW/HIGH report can change because a queue crosses an arbitrary threshold even when the underlying queue changes by only one job. Conversely, a large queue change can remain on the same side of the threshold. The binary encoding itself may dominate information lifetime.
