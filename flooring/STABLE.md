# RUNLU Deerfoot Flooring OS — Stable Baseline

**Stable version:** V0.3.63 · Unified Render Gate

**Stable entry:** `flooring/index-v063-unified-render.html`

**Production entry:** `flooring/index.html`

**Status:** Stable baseline

## Why V0.3.63 is the baseline

- Mac Safari left-pane flicker is resolved in testing.
- Calendar recursive DOM redraws are gated through the unified Safari renderer.
- Calendar Groups, Dual Edit, Schema Alignment, Event Rail, CHC People and multi-view behavior remain available.
- V0.3.60–V0.3.62 remain historical snapshots, but are no longer the rollback target.

## Development rule

All future Flooring OS Calendar work should build forward from V0.3.63. If a later version introduces a regression, roll back to V0.3.63 unless a newer stable baseline has been explicitly designated.

Do not modify unrelated RUNLU projects when working from this baseline.
