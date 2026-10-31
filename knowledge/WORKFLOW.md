# RUNLU KNOWLEDGE — Phase 0 editorial workflow

This is a **RUNLU website section**, not a separate app. Prototype branch only; do not deploy without review.

## Lifecycle
1. **inbox**: record discovery URL, publisher, date, jurisdiction, topic; no public display.
2. **draft**: write an original summary and add source evidence and translations.
3. **verification**: independently check facts, jurisdiction, copyright/license and translation.
4. **approved**: record named reviewer and review date; all three review booleans must be true.
5. **published**: make visible after explicit editorial approval and deployment.
6. **retired**: retain version and explanation; do not silently delete history.

## Safety gates
- Unknown, restricted or prohibited license: do not ingest copyrighted source content.
- Open metadata does not grant rights to the underlying full text.
- Jurisdiction-specific guidance must identify region and effective date.
- Do not represent example records as verified knowledge.
- Never store secrets, private customer data, or proprietary warehouse data here.
- Never automate public publication directly from collection or translation.
- New content should be data-driven, not hand-edited into HTML.
- Use Git review history initially; a database and editorial dashboard may follow once needed.

## Files
- `data/schema.json`: proposed JSON Schema contract.
- `data/records.json`: nonpublic draft records, not published knowledge.
- `data/published.json`: reviewed public export; currently empty.
- `index.html`: prototype UI loading only `data/published.json`, not raw drafts.
- `intake.html`: local JSON draft generator; does not submit or publish.

## Next engineering acceptance
- Keep structural checks, publication gates and end-to-end tests green in GitHub Actions.
- Prepare first real source-backed records as drafts; verify source access, claims, licensing and all four translations before approving.
- Test search, region filters, four languages and mobile accessibility.
- Verify rights and factual accuracy before public launch.
