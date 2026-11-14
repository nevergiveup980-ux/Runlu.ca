# iPhone field acceptance DEMO

This preview is synthetic-only: **DEMO DATA — NOT FOR PRODUCTION CUTTING**.
No login, application install, backend, inventory write or production database connection.

## Three entries

- `#demo=01` — Standard Carpet Job: complete rectangular allocation and waste.
- `#demo=02` — Multiple Rolls & Remnants: FULL/SHORT/REMNANT stock, optional rotation,
  candidate switching and computed material savings.
- `#demo=03` — Dye Lot / Insufficient Stock: limited required stock, other-lot stock
  cannot substitute, missing required lot, incomplete report and DO NOT CUT warning.

All results are computed by the same engine/scenario search. Demo inputs contain no
precomputed allocation, waste or savings. Tests check complete/incomplete results.

## iPhone Safari steps

1. Open the preview HTTPS URL and choose any of the three large DEMO buttons.
2. Tap **Calculate plan**. Check SF, SYD, Waste %, per-roll LF and missing pieces.
3. Select another strategy when offered. DEMO 03 may have only one distinct layout.
4. Use **+**, **−**, **Fit diagram** and touch-scroll inside the diagram frame.
   Safari page pinch zoom also remains enabled. Match numbered cuts to the full
   coordinate/dimension/orientation legend. Do not measure from image scale.
5. Practice the five pre-cut checklist confirmations. Changing inputs or strategy
   invalidates old confirmations and trial records.
6. Tap **Print / Save PDF**. In iPhone Safari's system print/share interface, save or
   share the PDF using the available iOS controls. DEMO and incomplete warnings
   remain visible on the printed report. This is not a formal signature.
7. Tap **Reset Demo** to restore that demo's original inputs, settings and blank
   reviews. Choose another DEMO to repeat. No real order is required.

The optional field trial form is practice only here. Any exported trial JSON carries
its demo ID and DEMO warning. Never enter actual customer data into this preview.
CSV/project-file import is disabled in the deployed demo-only entry. The regular
planner retains these features. All demo calculations stay in browser memory.

## Build and isolation

`npm run build:demo` emits only the planner's static entry and bundled engine to
`dist/demo/`. It does not include the RUNLU root site, databases or credentials.
The separate Vercel project is `runlu-carpet-iphone-demo`, project ID
`prj_VEEMUfDJEEZ7qUR7RZJ1wra9yIXL`, with no Git link, production domains or environment
variables. Deploy the emitted static files with **preview** target only. Response
headers disable indexing and network connections (`connect-src 'none'`). No main
branch merge or RUNLU production deployment is part of this workflow.

## Verification limits

Playwright's iPhone WebKit profile checks the Safari rendering engine, touch events,
portrait containment, direct links, input reset, zoom controls, checklist invalidation,
demo exports and print invocation/CSS. It does not run on physical iOS hardware or
exercise the native iOS print/PDF dialog. Verify that dialog, pinch gestures, display
orientation changes and actual printer pagination on a physical iPhone before field
acceptance. Synthetic demo success does not satisfy real-order release acceptance.
