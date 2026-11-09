# RUNLU AI SUPERMARKET — Foundation v0.1 Acceptance Record

Status: OPEN / NOT APPROVED FOR RELEASE
PR: https://github.com/nevergiveup980-ux/Runlu.ca/pull/450
Scope: isolated static foundation only; no third-party catalog or sales.

## Automated evidence
- Repository multilingual check: passing on PR head (verify latest checks again before approval).
- Dedicated AI Supermarket static guard: passing on PR head.
- General repository CI: passing on PR head.
- Headless Chromium browser acceptance passed on commit e6ea275dacf59c3272d2790188c3b0f34dee3fd1 (GitHub Actions job 129156346160, 2026-11-09): widths 320/375/390/430/768/1280, four language headings, reload persistence, horizontal overflow, page errors, and unexpected external requests. This is an automated local-file browser test, not a real-device or production test.
- Automated checks do not prove real-device usability, accessibility, or legal compliance.

## Manual browser acceptance (not yet performed)
Use an isolated PR preview or local checkout, **not** production:
- [ ] iPhone Safari narrow portrait (320–430px): no horizontal overflow; readable text; language selector operable.
- [ ] iPhone landscape / tablet: nav and grid remain usable.
- [ ] Desktop Chrome/Safari/Firefox: 3-column layout, no overlap or clipped text.
- [ ] Switch EN -> ZH -> FR -> ES -> EN; verify all headings, cards, notice and footer; refresh and verify language preference.
- [ ] Keyboard only: Tab to Home, Trust & Safety and language selector; visible focus; Enter/Space behavior.
- [ ] Screen reader: landmark structure, headings, nav and selector labels; no decorative emoji announced.
- [ ] Browser network panel: only first-party HTML/CSS/JS; no third-party scripts, trackers, API calls or payments.
- [ ] Console: no JavaScript errors or warnings from the new page.
- [ ] Existing homepage and existing RUNLU products unaffected.

## Security, privacy and legal acceptance
- [ ] No third-party logos, screenshots, product cards, partnership claims or unlicensed assets.
- [ ] No user uploads, prompts, authentication, payments or collection of personal data.
- [ ] Confirm no external scripts, iframes, remote fonts, or background requests.
- [ ] Verify the page's noindex directive and preview-only messaging.
- [ ] Review governance docs against actual company policies and applicable laws.
- [ ] Confirm no Stripe, database, account or deployment changes.

## Release decision
**Not approved.** Draft PR must remain unmerged until the founder explicitly approves the next step after reviewing evidence. An approval to merge is separate from approval to deploy, to publish third-party listings, and to start any paid integrations.

## Rollback
Before any eventual release, preserve a known-good main commit and verify the hosting platform's rollback path. Do not promise a rollback without testing it.

## Outstanding evidence
Actual device screenshots, human accessibility review, Safari/Firefox testing and deployment/preview configuration have not yet been supplied. Chromium CI logs are available at GitHub Actions job 129156346160.
