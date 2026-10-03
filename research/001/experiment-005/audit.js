// RUNLU R001 / E005
// Algebraic convex-mixture audit for Experiment 004.
import { run as runE4 } from "../experiment-004/simulator.js";

// E004 uses a fair shared bit. For any pair [a,b], expected linear metrics
// must equal 0.5*M(a)+0.5*M(b). This audit documents that control.
// A finite paired sample can deviate slightly because z partitions scenarios;
// robustness must be assessed across seeds and larger N.

export function audit({trials=100000,seed=20260921,accuracy=.72}={}){
  const e4=runE4({trials,seed,accuracy});
  return {
    experiment:"RUNLU-R001-E005",
    conclusion_basis:"shared-bit policies are classical randomized mixtures; discrete-frontier gains are insufficient evidence",
    trials,seed,accuracy,
    deterministic_frontier_points:e4.deterministic_frontier.length,
    correlated_frontier_points:e4.correlated_frontier.length,
    required_next_control:"convex-hull / randomized-classical comparison across accuracies and seeds"
  };
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("audit.js")) console.log(JSON.stringify(audit(),null,2));
