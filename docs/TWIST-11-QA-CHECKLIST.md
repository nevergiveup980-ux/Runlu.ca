# RUNLU TWIST 1.1 — QA and Apple review evidence checklist

Status: NOT tested on iPhone, NOT submitted to Apple. Source branch only.

## Functional acceptance tests
1. Load in English and Simplified Chinese. Every control and explanation changes language without losing saved progress.
2. Complete all 20 classic riddles; hint/reveal/self-rating/previous/next/reset all work, with no JavaScript errors.
3. Logic Studio: complete all 10 cases, verify correct answers and bilingual explanations; revisit prior cases.
4. Logic Studio expected answer indices: 1,1,3,0,1,1,1,0,0,1.
5. Reload app between answers; verify both studio and classic progress persist independently.
6. Corrupt localStorage keys twist-studio-v1, twist-reasoning-v1, twist-reflections-v1; app must still load.
7. On final challenge, Next disabled; Previous and Restart remain usable.
8. Verify 320px and 390px viewport, VoiceOver reading order, large text, landscape, and offline launch.
9. Test actual Xcode iOS WKWebView bundle, not only runlu.ca browser preview. Ensure local HTML contains changes.
10. Record tester, device, build number, test date, reproducible bugs and fixes. Do not invent external beta feedback.

## Content and correctness
- Classic riddles are labeled curated classics; do not claim they are original RUNLU creations.
- Logic Studio cases are newly authored, but simple deduction formats are common; uniqueness must be assessed at gameplay level.
- Check all 10 clues for unambiguous solutions and both translations for logical equivalence.
- Keep a rights/source log for any third-party text, icons or images.

## App Store review response
- Obtain complete reviewer questions 1–2.
- Answer all nine reviewer questions with evidence about provenance, testing, other RUNLU apps, third-party dependencies and ownership.
- Do not state a new iOS build exists until Xcode archive/upload is verified.
- Do not assert compliance or approval in advance.
