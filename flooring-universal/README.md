# RUNLU Flooring OS Universal

Commercial multi-company edition derived from the proven Deerfoot Flooring OS.

## Safety boundary

- Deerfoot Flooring OS under `/flooring/` remains the preserved production/reference edition.
- Universal development lives under `/flooring-universal/`.
- Universal code must not write to Deerfoot production datasets by default.
- No Universal release may silently migrate Deerfoot data.

## Architecture direction

Universal is configuration-driven rather than company-hardcoded:

Organization → Location → Member → Role → Flooring data

The first implementation milestone is U0 Tenant Foundation. Existing flooring workflows are ported only after their company-specific assumptions have been identified and parameterized.

## Product principles

1. Preserve the proven flooring workflow.
2. Paper-natural front end; database-rigorous back end.
3. Company identity, numbering, tax, document, warehouse and workflow rules come from configuration.
4. Tenant isolation is mandatory before commercial multi-company use.
5. Local/offline-friendly behavior may remain, but cloud data must have an explicit tenant owner.
6. Deerfoot remains the real-world reference implementation, not the Universal tenant database.
