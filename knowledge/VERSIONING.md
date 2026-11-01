# RUNLU KNOWLEDGE — Identity and Versioning Policy v0.1

## Identity
- Permanent IDs are `RK-0001`, `RK-0002`, ... and are never reused.
- The intake form's `RK-0000` is **only a placeholder**, not a permanent ID.
- IDs are allocated by a single editor/merge process, not by each browser.
- The highest previously issued ID (including retired records) determines the next number.
- Each record must retain a stable ID across language and regional revisions.

## Revision
- `version` begins at 1 and increases on every substantive published revision.
- Store immutable snapshots under `history/RK-0001/v0001.json`, etc.
- A revision must include the original record, timestamp, and human-readable reason in a history manifest.
- Corrections must not silently replace published claims. Retired records stay discoverable in editorial history.
- A later implementation must compare Git history against published versions to prevent rollback or ID reuse.

## Publication rules
- Intake/draft records are never automatically published.
- Publication requires a reviewer, date, fact and translation verification, and documented source rights.
- A CI pass only proves structural gates; it does not establish legal rights or factual correctness.
- Public data exports must exclude private intake notes, contact information, and secrets.

## Current limitations
- The proposed historical snapshot mechanism is a **policy**, not yet an automated archiver.
- A Git repository records file changes, but does not by itself enforce immutability or audit completeness.
- Editorial review and publication remain manual until a reviewed pipeline is built.
