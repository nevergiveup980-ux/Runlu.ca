# V0.3.80 startup visual stability hotfix

Purpose: remove the two short post-open flashes observed on Safari without changing business logic.

The V0.3.80 wrapper now:
- avoids calling auto-installing add-ons a second time after their script `load` event;
- keeps the opaque boot cover in place briefly while the initial management/Hold DOM work settles;
- reveals the business shell only after two animation frames;
- preserves the existing fail-open safety timeout.

No Order, PO, inventory, A/R, commission, accounting, or cloud data behavior is changed.
