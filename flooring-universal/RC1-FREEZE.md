# RUNLU Flooring OS Universal — Local-First RC1 Freeze

Status: **ENGINEERING FROZEN · REAL-DEVICE ACCEPTANCE NEXT**  
Branch: `feature/flooring-os-universal-foundation`  
Validated candidate runtime: `79cadf9bade653c79859b5c231de4295cb027a14`  
Runtime cache: **v54**

## Freeze rule

RC1 is feature-frozen. Until physical-device acceptance completes, changes are limited to release-blocking defects found by acceptance testing. No feature additions, no merge to `main`, no Deerfoot production changes, and no production Supabase changes.

## Automated evidence at freeze

- Cloudflare Pages: PASS.
- Site integrity / check: PASS.
- Flooring Universal Durability Lab: PASS.
- Same candidate was run through the durability lab a second time unchanged: PASS.
- Production interrupted resolver fixture matrix: PASS, including Recovery interruption states.
- Lifecycle acceptance: PASS.
- North Star full lifecycle model scenario: PASS.
- Browser runtime contract: PASS.
- Local-First persistence contract: PASS.
- Recovery interruption gate: PASS.
- Durability model: 4 seeds × 250,000 rounds per run. Two successful unchanged-candidate runs = **2,000,000 modeled stress rounds**.

These are automated/model/contract gates. They do not substitute for physical iPhone Safari/PWA acceptance or true process/power-loss testing.

## Physical iPhone acceptance gate

Use clearly synthetic data and run the frozen candidate without adding features:

1. Open Universal online and confirm workspace identity plus Device Ready.
2. Create a synthetic customer/job.
3. Advance the chain: Sales/Job → Supplier PO → Receiving → Warehouse → Installation → Customer Invoice → Payment.
4. Reload after key transitions and verify persistence.
5. Close/reopen Safari/PWA and verify normal startup.
6. Add/open from Home Screen where applicable.
7. After loading online, disable Wi-Fi/cellular and reopen; verify shell and existing local data remain available.
8. Restore connectivity and verify Local/Mirror health.
9. Exercise one Recovery Point or backup/restore using synthetic data.
10. Confirm successful recovery leaves no active Crash Journal marker and Device Ready returns clear.

## Promotion rule

Promote RC1 to **V1.0 Local-First** only after the physical-device gate passes. Any acceptance defect reopens RC1 only for the smallest targeted fix, followed by the automated gates again.

## Frozen principle

> Preserve the mother version. Grow a new branch.

RC1 remains isolated from Deerfoot. Merge to `main`, cloud migration, and production release require separate approval.
