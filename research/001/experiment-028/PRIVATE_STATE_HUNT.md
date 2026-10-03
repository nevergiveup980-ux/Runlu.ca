# Experiment 028 — Native Private-State Hunt

## Goal
Find a warehouse-native, time-varying private state that changes the *efficient safe* right-of-way assignment while both agents remain inside the certified stopping/safety envelope.

The variable must survive a physical/operational audit before any mathematical advantage test.

## Candidate variables

P1 Local remaining route cost
One mover may face a long reverse/reposition path if forced to WAIT while the other can yield cheaply.

P2 Load handling cost
A mover may carry a load for which stop/restart is slower or operationally costly, while still remaining safely stoppable.

P3 Local queue pressure
Each mover may privately observe a queue behind it; yielding one side can block more downstream work than yielding the other.

P4 Local task deadline/slack
Each mover may know private job slack/urgency while both actions remain safe.

P5 Energy/restart cost
Stopping and accelerating may have different local energy/time costs depending on load, grade, or machine state.

## Admission tests
A candidate survives only if:
- both WAIT and the selected single-entry action remain within the safety envelope;
- the state changes efficiency, not permission to violate safety;
- the state is genuinely local/private during outage;
- it changes on a timescale that defeats a fixed alternating schedule;
- its operational cost can be measured without inventing an XOR reward;
- a one-bit message would help when communication is available, confirming that the private information is decision-relevant.
