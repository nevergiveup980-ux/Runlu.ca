# RUNLU Website Evolution — Discovery & Measurement

Status: implementation branch (not published)
Date: 2026-10-23

## Verified existing architecture
- Main site is a static multilingual website: index.html, styles.css, script.js, runlu-language.js.
- The home page exposes four language choices: English, Chinese, French, Spanish.
- Control Center redirects from /control/ to /control-center.html.
- Pulse is linked at https://pulse.runlu.ca/; its backend and event schema are not yet verified.
- Site contains existing books, stories, frontiers, digital products, and games.

## Phase 1: low-risk discovery
1. Add a curated 'Continue exploring' section with valid internal links and all four translations.
2. Prefer editorial recommendations over opaque personalization; no tracking needed for initial launch.
3. Ensure keyboard accessibility, responsive layout, and nonintrusive placement.
4. Add event instrumentation only after identifying the existing Pulse collection API; never duplicate pageviews.
5. Never expose private Control Center or unpublished content through recommendations.

## Phase 2: RUNLU Guide
Start with an index of published pages and source links, with deterministic topic matching. Label AI answers distinctly if/when an LLM is added. No unsolicited popup, no secret keys in frontend, no fabricated availability.

## Acceptance criteria
- No regression in navigation or language switching.
- No personal data or content sent to third parties without disclosure/consent as appropriate.
- Links resolve and mobile view works.
- Preview verified before production promotion.
