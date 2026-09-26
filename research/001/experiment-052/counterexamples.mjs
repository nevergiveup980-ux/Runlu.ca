#!/usr/bin/env node
function ratio(s,d){ return d>0 ? s/d : null; }
function lower(a,b){ return a<b?"A":b<a?"B":"TIE"; }
function assert(c,m){ if(!c) throw new Error(m); }

// Same raw service balance, opposite demand-normalized conclusion.
const H1={servedA:50,servedB:50,demandA:100,demandB:60};
const H2={servedA:50,servedB:50,demandA:60,demandB:100};

const d1={A:ratio(H1.servedA,H1.demandA),B:ratio(H1.servedB,H1.demandB)};
const d2={A:ratio(H2.servedA,H2.demandA),B:ratio(H2.servedB,H2.demandB)};
assert(H1.servedA-H1.servedB===0 && H2.servedA-H2.servedB===0,"raw balances must match");
assert(lower(d1.A,d1.B)==="A","H1 should identify A as lower demand-normalized service");
assert(lower(d2.A,d2.B)==="B","H2 should identify B as lower demand-normalized service");

// Same service and demand counts, opposite opportunity-normalized conclusion.
const O1={servedA:40,servedB:40,demandA:80,demandB:80,oppA:80,oppB:50};
const O2={servedA:40,servedB:40,demandA:80,demandB:80,oppA:50,oppB:80};
const o1={A:ratio(O1.servedA,O1.oppA),B:ratio(O1.servedB,O1.oppB)};
const o2={A:ratio(O2.servedA,O2.oppA),B:ratio(O2.servedB,O2.oppB)};
assert(lower(o1.A,o1.B)==="A","O1 should identify A as lower opportunity-normalized service");
assert(lower(o2.A,o2.B)==="B","O2 should identify B as lower opportunity-normalized service");

// Demand itself can be misleading if not all demand was eligible/actionable.
const rawDemandExample={
  A:{arrivals:100,eligible:40,served:35},
  B:{arrivals:50,eligible:50,served:40}
};
const arrivalRatios={
  A:ratio(rawDemandExample.A.served,rawDemandExample.A.arrivals),
  B:ratio(rawDemandExample.B.served,rawDemandExample.B.arrivals)
};
const eligibleRatios={
  A:ratio(rawDemandExample.A.served,rawDemandExample.A.eligible),
  B:ratio(rawDemandExample.B.served,rawDemandExample.B.eligible)
};
assert(lower(arrivalRatios.A,arrivalRatios.B)==="A","raw-arrival normalization says A lower");
assert(lower(eligibleRatios.A,eligibleRatios.B)==="B","eligible-demand normalization says B lower");

console.log(JSON.stringify({
  schema:"e052-fairness-counterexamples-v1",
  raw_balance_counterexample:{
    H1:{...H1,raw_balance:0,demand_service_ratio:d1,under_served:lower(d1.A,d1.B)},
    H2:{...H2,raw_balance:0,demand_service_ratio:d2,under_served:lower(d2.A,d2.B)},
    conclusion:"Identical raw service balance can imply opposite demand-normalized fairness actions."
  },
  opportunity_counterexample:{
    O1:{...O1,opportunity_service_ratio:o1,under_served:lower(o1.A,o1.B)},
    O2:{...O2,opportunity_service_ratio:o2,under_served:lower(o2.A,o2.B)},
    conclusion:"Even identical service and demand counts can imply opposite opportunity-normalized conclusions."
  },
  eligibility_counterexample:{
    state:rawDemandExample,
    by_raw_arrivals:{ratios:arrivalRatios,under_served:lower(arrivalRatios.A,arrivalRatios.B)},
    by_eligible_demand:{ratios:eligibleRatios,under_served:lower(eligibleRatios.A,eligibleRatios.B)},
    conclusion:"The denominator must represent eligible/actionable demand, not merely arrivals."
  },
  overall:"Fairness state is objective- and denominator-dependent."
},null,2));
