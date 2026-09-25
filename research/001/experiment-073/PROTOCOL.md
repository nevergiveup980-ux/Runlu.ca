# Experiment 073 — Aggregation Reversal Audit

## Purpose
E072 checks whether individual numbers are comparable. E073 tests whether valid subgroup comparisons can reverse after pooling because subgroup weights differ.

## Fixture
Two methods A and B are evaluated on the same binary success metric in two strata:
EASY and HARD.

Within each stratum A has the higher success rate.

However, A receives mostly HARD cases while B receives mostly EASY cases.

## Required reporting
- subgroup numerators and denominators;
- subgroup rates;
- pooled numerators and denominators;
- subgroup weights for each method;
- aggregation rule;
- explicit reversal check.

## Principle
A pooled headline must not be interpreted as a within-stratum effect when exposure to strata differs.
