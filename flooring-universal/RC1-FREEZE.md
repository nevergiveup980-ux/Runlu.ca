# RUNLU Flooring OS Universal — RC1 Freeze

Status: **ENGINEERING FROZEN**
Freeze date: 2026-09-26
Branch: `feature/flooring-os-universal-foundation`

## Frozen scope

RC1 freezes the current Universal local-first engineering baseline. No new product features should be added to this RC unless a release-blocking defect is found.

The preserved Deerfoot production edition remains outside this freeze and must not be modified as part of Universal release work.

## Evidence at freeze

- Universal durability lab completed successfully at 1,000,000 deterministic stress rounds (4 seeds × 250,000 rounds).
- Production `universal-interrupted-resolver.js` is exercised directly by the resolver fixture matrix.
- Split persistence contradictions fail closed to `UNCERTAIN / REVIEW`.
- Repository site check completed successfully after aligning Flooring Universal with the existing app-owned localization boundary.
- Universal runtime remains isolated from `/flooring/` and direct Supabase runtime/client wiring in the durability gate.
- RC1 remains on the feature branch. It is not merged to `main` and is not a production deployment.

## Release boundary

**Freeze does not mean production release.**

Before merge/deployment, RC1 still requires real-device acceptance on iPhone/PWA, including:

1. Preview opens and core modules are reachable.
2. Install/Add to Home Screen behavior is acceptable.
3. Launch online, then operate offline.
4. Create/edit representative local records while offline.
5. Force-close and relaunch while offline.
6. Confirm local data survives relaunch.
7. Restore network and confirm the app remains healthy.
8. Exercise interrupted-operation review/recovery on device.
9. Confirm no Deerfoot production data is read or changed.

Any failure above reopens RC1 only for the smallest release-blocking fix plus regression coverage.

## Frozen principle

> Preserve the mother version. Grow a new branch.

RC1 is the engineering candidate for physical-device acceptance. Merge, deployment, cloud migration, and production release require separate explicit approval.
