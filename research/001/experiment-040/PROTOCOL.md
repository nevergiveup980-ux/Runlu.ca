# Experiment 040 — Break-Even Duration for Codebook Reconfiguration

Use the exact E038/E039 regret matrix. For active workload w, current codebook c and workload-specific target c*, define DeltaR=R(w,c)-R(w,c*).

Let C_switch be total trusted reconfiguration cost in regret-equivalent units. If DeltaR>0:

N_break_even=C_switch/DeltaR.

For integer encounters, strict benefit begins at floor(C_switch/DeltaR)+1.

C_switch remains symbolic; no physical warehouse cost is invented.
