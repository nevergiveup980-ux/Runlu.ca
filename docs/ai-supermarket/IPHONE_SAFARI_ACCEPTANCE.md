# RUNLU AI SUPERMARKET — iPhone Safari Acceptance Protocol

Status: NOT RUN / NOT APPROVED. Applies only to PR #450 isolated foundation preview.

## Preconditions
- Use a reviewed, isolated HTTPS preview URL only after separate approval. Do **not** deploy the draft branch to the production domain to perform this test.
- The GitHub Actions offline ZIP is **not** an HTTPS Safari preview. Opening an HTML file from iPhone Files does not reproduce production hosting behavior.
- Record preview URL, commit SHA, iPhone model, iOS version, Safari version if available, tester, and test date. Do not put credentials or private device information in public PR comments.

## Test cases (record PASS / FAIL / NOT TESTED and screenshot or short reproduction note)
1. Portrait at native iPhone width: page fits without horizontal scrolling; header and hero do not overlap; text remains readable at default and larger text settings.
2. Landscape: navigation, language selector, six cards and trust notice remain visible and usable without clipped content.
3. Touch: Home, Trust & Safety, and language selector are easy to tap without accidental adjacent activation. Automated CI checks 44px minimum **height** and 24px minimum **width**; this does not establish universal 44×44px targets.
4. EN → ZH → FR → ES → EN: headings, six category names, safety notice and footer all change correctly; page document language matches the selection.
5. Refresh after choosing a non-English language: selection and visible text persist.
6. Safari Back/Forward and in-page Trust & Safety anchor: no broken focus or unexpected scroll.
7. iOS VoiceOver: heading navigation, main landmark, labeled language selector and link names make sense; decorative category symbols are not read as content.
8. iOS zoom/larger text: no clipping, hidden controls or overlap at enlarged settings.
9. Network and privacy (desktop inspector or equivalent): no unexpected third-party scripts, API requests, trackers, sign-in or payments.
10. Confirm this is explicitly a foundation preview, with no third-party product endorsements or purchase actions.

## Evidence and decision
- Attach redacted screenshots for portrait/landscape and each failure; record exact steps to reproduce.
- Mark each test individually; do not infer a PASS from automated Chromium checks.
- Release gate: any blocking failure remains open until fixed and retested. A complete PASS does not itself authorize merging, deploying, listings, payments or integrations.
- PR remains Draft until explicit founder approval.
