#!/usr/bin/env node

function snapshot(ages,tau=600){
  return {
    count:ages.length,
    oldest:ages.length?Math.max(...ages):0,
    sum:ages.reduce((a,b)=>a+b,0),
    overdue:ages.filter(x=>x>=tau).length
  };
}
function sameSnapshot(a,b,tau=600){
  return JSON.stringify(snapshot(a,tau))===JSON.stringify(snapshot(b,tau));
}
function nextBalance(D,action){ return action==="A" ? D+1 : D-1; }
function fairnessPenalty(D,action){ return Math.abs(nextBalance(D,action)); }
function fairnessChoice(D){
  const a=fairnessPenalty(D,"A"), b=fairnessPenalty(D,"B");
  return a<b?"A":b<a?"B":"TIE";
}
function oneStepWaitChoice(aA,aB){
  const sA=snapshot(aA).sum, sB=snapshot(aB).sum;
  return sA>sB?"A":sB>sA?"B":"TIE";
}
function assert(c,m){ if(!c) throw new Error(m); }

// Identical live queue state in both histories.
const queueA=[600,300];
const queueB=[600,300];
assert(sameSnapshot(queueA,queueB),"current queue snapshots should match");

// History H1: A has been favored.
const H1={served_A:9,served_B:1};
const D1=H1.served_A-H1.served_B;

// History H2: B has been favored.
const H2={served_A:1,served_B:9};
const D2=H2.served_A-H2.served_B;

assert(oneStepWaitChoice(queueA,queueB)==="TIE","snapshot waiting objective should tie");
assert(fairnessChoice(D1)==="B","H1 fairness restoration should choose B");
assert(fairnessChoice(D2)==="A","H2 fairness restoration should choose A");

// A single derived scalar is sufficient for this narrow immediate fairness term.
assert(fairnessChoice(+8)==="B","positive debt should favor B");
assert(fairnessChoice(-8)==="A","negative debt should favor A");

console.log(JSON.stringify({
  schema:"e051-dynamic-counterexample-v1",
  current_snapshot:{
    A:snapshot(queueA),
    B:snapshot(queueB),
    one_step_wait_choice:oneStepWaitChoice(queueA,queueB)
  },
  histories:{
    H1:{...H1,fairness_balance:D1,next_choice:fairnessChoice(D1)},
    H2:{...H2,fairness_balance:D2,next_choice:fairnessChoice(D2)}
  },
  conclusion:"Identical current queue snapshots can require opposite next actions when the objective includes service-history fairness.",
  minimal_state_for_this_narrow_fairness_term:"fairness_balance = served_A - served_B"
},null,2));
