# RUNLU Flooring OS Universal — U1 Foundation Freeze

Status: **FROZEN FOR HARDENING**  
Branch: `feature/flooring-os-universal-foundation`

## Boundary
The Deerfoot Flooring OS under `/flooring/` remains the preserved production/reference mother version. Universal development lives under `/flooring-universal/`.

## U1 closed lifecycle
Company → Customer → Job → Items → Estimate → Quote → Supplier PO → Pickup/Delivery → Receiving → Warehouse → Installation → Customer Invoice → Payment.

Supplier finance branch: Receiving → Supplier Invoice Match → Ready to Pay → Paid.

## Safety stack
1. Lifecycle Guards — forward-only/terminal state protection.
2. Audit Trail — append-only lifecycle event history.
3. Lifecycle Gate — tenant/linkage/ledger integrity diagnostics.
4. Recovery / Reconciliation — trusted-source repair recommendations without silent mutation.
5. Release Gate — non-destructive module and contract regression checks.
6. Scenario Simulator — isolated normal, exception, and partial-payment scenarios.

## Freeze audit
- Universal source search found no Deerfoot branding/reference in the Universal path.
- No `runlu_deerfoot_*` storage key was intentionally introduced.
- No Deerfoot 5% GST rule was copied.
- No Deerfoot Supabase project URL was introduced.
- Universal U1 remains local-first; cloud tenant provisioning is not enabled.
- Company invoice/PO numbering remains company-controlled; central transactional numbering is deferred to cloud tenant work.
- U1 scenario tests are isolated and must not write local workspace, Deerfoot, Supabase, or cloud data.

## Next phase gate
Do not add broad new U1 business modules before cloud foundation. U2 begins with authenticated tenant provisioning and server-enforced organization/location/member/role isolation, followed by migration of U1 records from local-only ownership to explicit tenant ownership.

No Deerfoot production migration is implied by this freeze.
