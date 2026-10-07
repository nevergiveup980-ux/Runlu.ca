# Isolated shared-order pilot

Entry: `/flooring/order-pilot.html`. This is a separate storage prerequisite, not a certification or replacement of the installed Deerfoot workflow.

Use an existing Supabase account on both devices. Only the owner can read/create/update their own rows. There is no signup, cross-account sharing, deletion, production import or business side effect. Tokens stay in memory, so reload requires sign-in. No localStorage or sessionStorage is used. Use fictional data only.

The standalone table `flooring_order_pilot` does not connect to jobs, quotes, PO, payments, inventory or customer tables. Draft/confirmed states are explicit; quotes do not create orders. Confirmation here does not dispatch real work.

## Acceptance on two physical devices

1. On computer, sign in, enter a fictional customer and line item, save. Record the full TEST UUID and version.
2. On phone, sign in with the same account, load orders and open that UUID. Confirm all values.
3. Change quantity on phone and save. Refresh the computer list and open the order; confirm the new quantity and version.
4. Open the same version on both devices. Save on the phone, then attempt a save from the stale computer form. The computer must show a conflict without overwriting the phone.
5. Confirm the test order, load it on the other device, and verify confirmed state.
6. Sign out. Another account must not see the order. No real order, PO, payment or inventory data should change.

Database role tests and browser-mocked tests are separate evidence from this physical-device checklist. Until this checklist is performed, cross-device acceptance remains unverified.

Schema source: `database/flooring-order-pilot.sql`. Applied as a named remote migration; no existing business schema modified. Rollback: remove pilot entry/assets; preserve test table for review, or drop only this table and its version function after test-data review.
