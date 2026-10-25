# RUNLU Growth Engine — Lost Meridian pilot verification

Status: Draft PR only. No live analytics backend, dashboard, or persistence is included.

## Browser verification (on a preview deployment, not production)

1. Open `/book/lost-meridian/?utm_source=x&utm_medium=social&utm_campaign=lost_meridian_launch`.
2. In DevTools Console, register `window.addEventListener('runlu:growth', e => console.log(e.detail))` **before** reloading to capture the page-view event.
3. Reload and verify `book_page_view` with source `x` and campaign `lost_meridian_launch`.
4. Click Chapter 1 and verify `book_preview_click` with chapter `1`.
5. Repeat with TikTok UTM and verify source `tiktok`.
6. Open the page without UTM and verify source `unattributed`, not `direct`.
7. Confirm invalid UTM values become `other` / `none`, with no raw query strings or personal identifiers in the payload.
8. Verify chapter links, cover, mobile navigation and four-language selector remain functional.
9. Confirm no browser cookies, localStorage writes or outbound network requests are introduced by `growth-events.js`.

## Before enabling analytics

- Decide whether to integrate an existing first-party analytics collector or deploy a new one.
- Confirm privacy disclosures, data retention, consent requirements and bot filtering.
- Avoid double counting existing Cloudflare page views.
- Do not equate external-link clicks with confirmed book sales.
- Merge only after preview tests and an explicit release decision.

## Scope

Only the Lost Meridian landing page loads the adapter. The reader page is unchanged.
