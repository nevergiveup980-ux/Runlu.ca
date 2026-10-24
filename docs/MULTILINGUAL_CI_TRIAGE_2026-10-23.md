# Four-language CI failure triage — 2026-10-23

Source: GitHub Actions Site integrity, run 40064519860, job 120784856988.

## Finding
The existing global check `node scripts/check-multilingual.mjs` reported **114 issues** on the feature branch. The same check also fails on the main branch. The failing step is "Enforce complete four-language pages", not the new Discovery smoke test.

## Affected examples
- `chronicle/008-five-first-pass-approvals.html`: missing language selector and shared script.
- `chronicle/twilight-crescent-moon-2026-{en,fr,es}.html` and the base page: shared script not loaded.
- `wellness-twelve-*.html`: many localized standalone articles lack standard selector/shared script.
- `flooring-u3-preview/index.html`, `invest/privacy.html`, `invest/support.html`, `runlu-invest.html`, `truth-and-lies.html`: need page-type classification before deciding whether shared site navigation is appropriate.
- `view-040-when-weather-forecasts-learn-from-their-errors.html` and `view-041-when-ai-assistants-change-the-safety-rails.html`: missing standard selector.

## Resolution plan
1. Keep the global integrity gate intact; do not add a blanket exemption.
2. Classify pages as shared multilingual site, standalone language edition, product application, or support/legal.
3. For shared site pages, restore the shared selector and language script using relative paths correct for their directory.
4. For standalone editions, verify canonical links and language navigation before changing their contract.
5. Add explicit and narrowly documented exemptions only for pages that are intentionally outside the shared website.
6. Re-run the full CI check and the Discovery smoke test before merging PR #345.

## Discovery-specific status
The new RUNLU Discovery smoke test succeeded on run 40064522230. Browser visual/mobile verification is still pending.
