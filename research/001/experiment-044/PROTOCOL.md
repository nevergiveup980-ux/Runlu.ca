# Experiment 044 — Minimum Real Telemetry Bridge

E044 defines the smallest observational dataset needed to calibrate Research 001B against real warehouse operations without connecting research code to production control.

Questions: empirical queue-pressure distribution; drift; regime persistence; compact-encoding loss; empirical oracle headroom.

Minimum fields: event_id, observed_at, coarse site_context, side_a_queue, side_b_queue, opportunity, source_mode, schema_version.

Exclude employee/customer names, order/customer identifiers, unnecessary product detail, device/location tracking, personal free text, and all autonomous/write-back fields.

Research code has no production write path.