# U0 — Tenant Foundation

## Goal

Build the Universal edition without modifying the preserved Deerfoot production edition.

## Required tenant model

- organizations
- locations
- organization_members
- roles / permissions
- tenant-owned Flooring records

Every cloud business record must ultimately resolve to an organization. Location ownership is added where operationally relevant.

## Migration policy

This branch does **not** migrate Deerfoot production data.

Universal schema work should be additive and isolated. Deerfoot may later be used as a reference tenant fixture or controlled import source only after explicit approval.

## Company-specific rules to extract

- company/brand names and abbreviations
- PO, claim and invoice numbering
- paper/document headings and templates
- tax and compliance jurisdiction
- warehouse integration URL and behavior
- branch/location structure
- staff roles and permissions
- supplier/customer defaults

## Porting order

1. Tenant identity and authorization
2. Company/location configuration
3. Jobs / Orders
4. Supplier Orders / PO
5. Customers / Payments
6. Calendar / Installation
7. Warehouse bridge
8. Pricing / Accounting / Claims
9. Reporting and commercial packaging

No module is considered Universal merely because its UI has been renamed.
