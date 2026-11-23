# RUNLU GROWTH OS — GA4 Safari acceptance checklist (PR #490)

Status: **NOT YET VERIFIED ON A REAL DEVICE**. This is a test plan, not evidence of a passed test. Keep PR #490 in Draft until approved.

## Prerequisites
- Use a separately hosted HTTPS preview built from the exact PR head; do not use the live production site as evidence of PR behavior.
- Record preview URL, build SHA, iPhone model, iOS/Safari version, date, tester, and screenshots.
- Confirm that preview is not indexing publicly, is not collecting sensitive form data, and does not affect RUNLU Pulse.
- Confirm Google Analytics measurement ID is G-KVRWEFJMCR and GA4 Realtime/DebugView is available.

## Safari tests
1. Clear the preview origin's stored site data (or use a fresh isolated browser profile). Open preview. Verify consent banner is visible in the active language and neither GA4 script nor GA4 collect request appears before consent.
2. Tap **Reject**. Verify the banner closes, localStorage key `runlu_analytics_consent_v1` is `denied`, and no GA4 network collection occurs. Reload and verify rejection persists.
3. Tap footer **Analytics choices**. Verify the choice dialog can be reopened. Tap **Accept**. Verify one GA4 script is inserted, and at most one `page_view` is recorded for a single page load.
4. Reload with consent granted. Verify no duplicate banner or duplicate GA4 script. Verify one expected `page_view` per actual navigation.
5. Reopen settings and tap **Reject**. Verify the denial is persisted before reload, GA4 is disabled after reload, and no further GA4 collection is sent. Data previously transmitted cannot be retracted.
6. Repeat the consent UI in English, Chinese, French and Spanish. Verify labels update and both buttons remain accessible.
7. Test iPhone portrait and landscape, including Safari bottom controls, safe-area inset, zoom and small viewport. Verify the banner does not block essential navigation or put buttons off-screen.
8. Verify the privacy policy link works and that the existing RUNLU Pulse remains unchanged.
9. Inspect GA4 Realtime after accepting. If no activity is shown, record that outcome rather than assuming the integration works.

## Evidence table
| Test | Result (PASS/FAIL/NOT RUN) | Screenshot / observation |
| --- | --- | --- |
| First visit: default off | NOT RUN | |
| Reject and persist | NOT RUN | |
| Reopen settings and accept | NOT RUN | |
| One page_view per load | NOT RUN | |
| Revoke and persist | NOT RUN | |
| Four languages | NOT RUN | |
| iPhone safe area | NOT RUN | |
| Privacy and Pulse unchanged | NOT RUN | |
| GA4 Realtime observed | NOT RUN | |

## Release decision
- GitHub Actions tests alone are **not** Safari, consent-network, or GA4 Realtime evidence.
- Do not merge #490 until the preview test evidence is reviewed and the owner explicitly approves production rollout.
- No new hosting service or paid subscription should be enabled just for this preview without approval.
