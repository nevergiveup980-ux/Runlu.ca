# RUNLU Ledger · App Store Screenshot Capture Runbook

Status: staging capture guide for App Store Candidate V2.3.

## Current Apple constraints checked 2026-09-06
- iPhone App Store listing accepts 1–10 screenshots.
- PNG/JPEG/JPG are accepted.
- Screenshot images cannot contain alpha/transparency.
- A valid current 6.9-inch portrait size is **1320 × 2868 px**. Apple also accepts other listed 6.9-inch resolutions.
- If the UI is the same across device sizes, Apple can scale the highest-resolution supplied screenshots for smaller iPhone sizes.

Official references:
- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots

## Capture board
Use:
`life-ledger-appstore-shotboard.html?shot=N`

The board is built at **1320 × 2868** and embeds the actual V2.3 candidate screenshot state rather than drawing a fake finance UI.

### Shot 1
Query: `?shot=1`

Headline:
**See your month at a glance.**

Support:
`Income. Spending. Balance. Clear in seconds.`

Purpose: category comprehension in the first frame.

### Shot 2
Query: `?shot=2`

Headline:
**Every transaction stays easy to follow.**

Support:
`Search, review, and edit the record that changed.`

Purpose: prove the Entries working view.

### Shot 3
Query: `?shot=3`

Headline:
**One ledger. Two views. Both editable.**

Support:
`Entries for detail. Sheet View for the whole month.`

Purpose: primary differentiated promise.

### Shot 4
Query: `?shot=4`

Headline:
**Add a record in seconds.**

Support:
`Amount first. Familiar items stay close.`

Purpose: prove low-friction daily entry.

### Shot 5
Query: `?shot=5`

Headline:
**Your ledger stays under your control.**

Support:
`No bank connection required. Export when you want.`

Purpose: privacy / portability reassurance.

## Capture rules
- Fictional sample data only.
- Never show personal financial data.
- No fake ratings, reviews, awards, download counts, or ranking claims.
- No competitor names.
- No device-state notifications or unrelated personal content.
- Keep the RUNLU brand present but secondary to the product proof.
- Avoid excessive decorative copy; the app UI must remain the hero.

## Screenshot order
Launch order remains:
1. Home comprehension
2. Entries confidence
3. Dual-view differentiator
4. Quick Add speed
5. Privacy/control

After launch, Product Page Optimization may test moving the dual-view frame into slot 1, but only after real conversion data exists.

## Final capture QA
Before uploading each image:
- exact accepted pixel dimensions;
- no alpha channel;
- no clipped headline/support line;
- app content readable at App Store thumbnail size;
- fictional data only;
- no Candidate/Debug badge visible;
- name displayed consistently as RUNLU Ledger where visible;
- no browser chrome in final exported image;
- spelling and punctuation verified.