# THE GLASS THRONE — Campaign tracking acceptance checklist

Scope: `book/campaign-tracker.js` and the Apple Books CTA on `book/the-glass-throne.html`.

## Preview checks (do not merge before completion)

1. Load `/book/the-glass-throne.html?utm_source=tiktok&utm_medium=organic_social&utm_campaign=glass_throne_launch`.
2. In the browser console inspect `window.RUNLU_CAMPAIGN.attribution`; confirm the three values match.
3. Run `window.addEventListener("runlu:campaign", e => console.log(e.detail))` and click the **English** Apple Books CTA. Confirm event `runlu_store_click`, book `the-glass-throne`, store `apple-books`.
4. Confirm Apple Books opens the existing official Canadian store URL, with no broken navigation.
5. Repeat with `utm_source=x`; confirm the changed source.
6. Test malformed / very long UTM values; they should be ignored.
7. Check iPhone-sized viewport and language switching.
8. Verify no analytics network requests, cookies or local storage writes are introduced by this feature.

## Limits

- This version dispatches **in-page events only**. No server receives or counts clicks.
- It cannot measure purchases on Apple Books or Google Play Books.
- Google Play Books English-edition URL must be verified before a button is added.
- Privacy review and explicit analytics receiver approval are required before collection.

## Suggested first-campaign naming

- Campaign: `glass_throne_launch`
- Medium: `organic_social`
- Sources: `tiktok`, `x`
