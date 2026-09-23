# E052 — Structural Results

## 1. Equal service counts do not imply demand-normalized equality

Both histories have:
- served_A = 50;
- served_B = 50;
- raw balance = 0.

H1 demand:
- A = 100;
- B = 60.

Service/demand:
- A = 0.50;
- B ≈ 0.8333.

H1 identifies A as relatively under-served.

H2 swaps the demand:
- A = 60;
- B = 100.

Service/demand:
- A ≈ 0.8333;
- B = 0.50.

H2 identifies B as relatively under-served.

The same raw fairness balance implies opposite actions.

## 2. Demand counts still do not identify opportunity-normalized fairness

With identical service and demand counts, changing which side actually had eligible service opportunities reverses the opportunity-normalized conclusion.

Therefore demand and opportunity are distinct denominators.

## 3. Raw arrivals can be the wrong demand denominator

Synthetic example:
- A: 100 arrivals, 40 eligible, 35 served;
- B: 50 arrivals, 50 eligible, 40 served.

Normalize by raw arrivals:
- A = 0.35;
- B = 0.80;
- A appears under-served.

Normalize by eligible demand:
- A = 0.875;
- B = 0.80;
- B appears under-served.

The conclusion reverses.

## Core result

`fairness_balance = served_A-served_B` is sufficient only for the narrow equal-share objective defined in E051.

For demand/opportunity-aware fairness, the denominator is part of the state and part of the objective semantics.
