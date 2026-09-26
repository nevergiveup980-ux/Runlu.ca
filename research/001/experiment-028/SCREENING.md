# E028 — First-Pass Screening

## P1 Remaining route cost
Plausible, but often known from the shared task planner before outage. If pre-shared, it is not genuinely private at decision time. HOLD.

## P2 Load handling cost
Operationally plausible and measurable. But load identity/weight may also be pre-known centrally. The private component would need to be a genuinely local dynamic condition, not static job metadata. HOLD.

## P3 Local queue pressure
Strong candidate. Queue length can change locally during an outage and can alter the delay cost of assigning WAIT while leaving safety unchanged. It is naturally measurable as vehicles/jobs delayed. PASS to formalization.

## P4 Deadline/slack
Decision-relevant, but often centrally scheduled and therefore potentially shared before outage. Private last-second slack changes need justification. HOLD.

## P5 Energy/restart cost
Measurable but likely secondary; local machine state can be private, yet efficiency differences may be small relative to scheduling. HOLD.

## Selected candidate
**P3 Local queue pressure** advances to E029.

Important: this does not imply any correlation advantage. It only survives the native-variable screen.
