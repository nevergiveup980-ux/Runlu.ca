# E040 — Illustrative Unit-Cost Example

For C_switch=1 synthetic regret-unit only:

- U: 2/4/7 -> 4/8/12: N_min=3
- U: 3/8/14 -> 4/8/12: N_min=13
- U: 3/7/12 -> 4/8/12: N_min=65
- L: 4/8/12 -> 2/4/7: N_min=6
- L: 3/8/14 -> 2/4/7: N_min=8
- L: 3/7/12 -> 2/4/7: N_min=11
- B: 4/8/12 -> 3/8/14: N_min=17
- B: 2/4/7 -> 3/8/14: N_min=4
- B: 3/7/12 -> 3/8/14: N_min=24

These counts are not warehouse recommendations.

## Next drill
E041 should treat regime duration as uncertain and compare expected future regret savings against switching cost rather than assuming persistence is known.
