# RUNLU Core v0.1

RUNLU Core is the reusable technical foundation shared by RUNLU software. It extracts stable primitives that otherwise get rewritten across Warehouse OS, Flooring OS, Universal Invoice, the private asset system, Life Ledger, LINGGUANG and future tools.

The goal is not to turn every RUNLU product into one giant application. Products remain independent. Core only owns capabilities that are genuinely reusable.

## V0.1 modules

### Existing shared language layer

`/runlu-language.js` remains the canonical website language layer. It already provides the four-language state (`en`, `zh`, `fr`, `es`), one shared localStorage language key, migration from older language keys, page translation hooks and the `runlu:languagechange` event.

### `/core/runlu-core.js`

Browser-safe shared primitives:

- DOM helpers
- UI busy/message helpers
- current RUNLU language lookup
- safe URL/key/file-name normalization
- HTML escaping
- SHA-256 hashing
- byte formatting
- timestamped file naming
- browser download helper
- small event bus

It exposes these through `window.RUNLU` and publishes its version at `RUNLU.core.version`.

### `/core/runlu-cloud.js`

Provider adapter for RUNLU's current Supabase foundation:

- singleton browser client
- persisted authentication session
- sign in / sign up / sign out
- current session / current user / require-user helpers
- table access
- Storage upload / download / remove
- immutable timestamped user file paths

Only the public browser configuration belongs here. Secret/service-role credentials must never be placed in Core or any client-side file.

### `/core/core-test.html`

A read-only, `noindex,nofollow` smoke-test page. It verifies that the Core namespace, language layer, browser crypto, Supabase adapter and current auth-session read can initialize together. It intentionally performs no database or Storage writes.

## Design rules

1. **Stable before clever.** A shared helper enters Core only after it has appeared repeatedly in real RUNLU work.
2. **Shared primitive, not business rule.** Flooring pricing, warehouse inventory rules, invoice billing logic and health-domain logic stay inside their products.
3. **Least privilege.** Client code uses only the publishable key. Private data remains protected by authentication and RLS.
4. **Backward compatible adoption.** Existing working products are not rewritten all at once. Core is introduced first, then adopted product by product.
5. **No secrets.** Passwords, API secrets, recovery codes, private tokens and service keys never belong in the browser bundle.
6. **Observable.** Every Core release should have a simple smoke test and a version number.
7. **Rollback remains possible.** Product-specific stable baselines remain valid while adoption proceeds.

## Adoption roadmap

- **V0.1 — Foundation:** shared browser primitives, Supabase adapter, smoke test and architecture contract.
- **V0.2 — Master Copy Vault:** migrate duplicated auth, hashing, file naming and Storage helpers to Core without changing the Vault data model.
- **V0.3 — Private Asset Ledger:** migrate duplicated auth and common UI helpers.
- **V0.4 — File layer:** add resumable upload support and reusable export/backup helpers where real files require it.
- **V0.5 — Common data primitives:** evaluate reusable asset/customer/contact schemas only after two or more products prove the same shape.
- **V0.6 — Device/AI adapters:** reserve common contracts for scanning, voice and AI while keeping provider-specific secrets server-side.

## What does not belong in Core

- warehouse location/cut/inventory rules
- flooring estimates, pricing and operational workflows
- invoice numbering, tax or subscription business logic
- LINGGUANG clinical/domain semantics
- RUNLU editorial prose and book content
- app-specific UI screens

That boundary is deliberate: RUNLU Core should reduce duplication without becoming a new source of coupling.
