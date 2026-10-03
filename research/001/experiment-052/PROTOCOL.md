# Experiment 052 — Fairness Relative to Demand and Opportunity

## Purpose
Attack E051's raw service-balance state.

A raw count such as `served_A - served_B` only represents equal-share fairness when the sides had comparable eligible demand/opportunity.

E052 separates:
- raw service equality;
- demand-normalized service;
- opportunity-normalized service.

## Definitions
For side i over a declared accounting window:

S_i = number of services allocated.
D_i = eligible demand units presented.
O_i = eligible service opportunities in which side i could have been served.

Raw equal-share comparison:
S_A vs S_B.

Demand-normalized service ratio:
S_i / D_i, when D_i > 0.

Opportunity-normalized service ratio:
S_i / O_i, when O_i > 0.

## Structural question
Can two histories have identical raw service balance but imply opposite under-service conclusions once demand or opportunity is considered?

If yes, `fairness_balance = served_A-served_B` is not sufficient for those objectives.

## Boundary
This is a synthetic state-sufficiency audit. It does not define the morally or operationally correct fairness objective for Warehouse OS.
