# E088 — Provenance Evidence Freshness Result

E088 separates evidence age from evidence applicability.

CURRENT uses the same artifact version and digest at verification and execution:
CURRENT_VERIFICATION.

STALE_VERSION executes version 2 after version 1 was verified:
STALE_VERIFICATION.

STALE_DIGEST keeps the nominal version label but changes the digest:
STALE_VERIFICATION.

This catches silent rebuild/replacement under an unchanged human-readable version.

FUTURE verifies the matching artifact only after the claimed experiment execution:
FUTURE_VERIFICATION.

Without an immutable execution-time record, later verification cannot by itself establish what artifact was actually used earlier.

MISSING lacks a digest binding:
MISSING_BINDING.

## Core result

Fresh provenance is not "verified recently."

It is:

verified evidence bound to the exact artifact identity used by the experiment.

Version labels alone are insufficient when content can change under the same label.

## Scope

Synthetic governance fixture only. No prior RUNLU experiment is retroactively certified by E088.
