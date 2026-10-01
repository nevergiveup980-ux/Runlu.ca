# RUNLU Flooring Quote V0.4.03i — Frozen Stable Baseline

Status: **FROZEN STABLE**  
Original iPhone acceptance: 2026-09-20
Dual Entry baseline refreshed: 2026-09-30  
Production baseline source merge: `15ce4782e0be42daafb0eecd70d9a1108cba3843`

## Frozen artifacts

- `flooring/index-v0403i-quote-stable-frozen.html`
  - Git blob SHA: `f6adde9851d24af4ae45cacff2952e771f9dc74a`
- `flooring/quote-dual-entry-v0403i-stable-frozen.js`
  - Git blob SHA: `79a86661d19f30caa6b34cfd6accf5849d659a82`

## Frozen behavior

This baseline is the accepted Quote workflow:

- iPhone Quote runs top-level with no iframe.
- **Quote Form Entry** and **Database Fields** are equal, parallel editing modes.
- First use defaults to **Quote Form Entry**; each device remembers the last mode chosen.
- The large Deerfoot Quote itself is the editing surface.
- Database Fields and Quote Form Entry share one in-memory Quote object; switching modes does not create a second Quote.
- Quote saves to the existing `runlu_deerfoot_flooring_jobs_v1` Job record.
- Materials and Labour use ready rows; untouched scaffold rows are stripped before save.
- Line totals, subtotal, GST and grand total update live.
- Printing temporarily renders a clean read-only Quote and restores editing afterwards.
- No inventory, PO, warehouse, calendar, Supabase, or network-write behavior is added by the Quote module.

## Freeze rule

**Do not edit the two frozen artifacts in place.**

Any future Quote enhancement must be implemented in new versioned files and tested separately. Production may be moved away from this baseline only through an explicit release change after real-device acceptance. The frozen files remain available as the rollback/reference baseline.
