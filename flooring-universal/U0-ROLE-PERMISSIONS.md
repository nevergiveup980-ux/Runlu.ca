# U0 Role Permission Matrix

This is the first Universal role model. It does not change Deerfoot.

| Role | Primary scope |
|---|---|
| Owner | Full company control, including company, members, locations and financial workflows |
| Admin | Day-to-day system administration and broad operations |
| Manager | Operational control without company ownership controls |
| Sales | Jobs, sales, PO initiation, pricing visibility and claims workflow |
| Warehouse | PO visibility, scheduling visibility and warehouse operations |
| Installer | Assigned scheduling visibility; future scope will be assignment-based |
| Accounting | Payments, accounting, financial reporting and required read dependencies |
| Viewer | Read-only operational visibility |

## Security rules

1. UI permissions improve usability; they are never the security boundary.
2. Database RLS remains authoritative.
3. A role never bypasses organization membership.
4. Location-scoped access must additionally respect assigned locations.
5. Financial write access is intentionally narrower than operational access.
6. Member/role changes require Owner/Admin control and an audited write path.
7. No Universal role grants access to Deerfoot production data.

## Next gate

Before write policies are activated, test every capability as:
Organization membership → location assignment (when applicable) → role capability → requested row/action.
