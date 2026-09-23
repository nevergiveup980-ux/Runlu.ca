#!/usr/bin/env node

function summary(ages,tau=600){
  return {
    count:ages.length,
    oldest:ages.length?Math.max(...ages):0,
    sum:ages.reduce((a,b)=>a+b,0),
    overdue:ages.filter(x=>x>=tau).length
  };
}
function choose(a,b,score){
  const A=score(a), B=score(b);
  return A>B?"A":B>A?"B":"TIE";
}
function same(keys,x,y){
  return keys.every(k=>x[k]===y[k]);
}
function assert(cond,msg){ if(!cond) throw new Error(msg); }

// Counterexample 1: count + oldest cannot identify cumulative-wait priority.
const thin=[1200,0,0,0];
const dense=[1200,1100,1100,1100];
const thinS=summary(thin), denseS=summary(dense);
assert(same(["count","oldest"],thinS,denseS),"T1 summaries should match");
assert(thinS.sum!==denseS.sum,"hidden cumulative wait should differ");

const sumScenario1={A:thin,B:dense};
const sumScenario2={A:dense,B:thin};
assert(choose(sumScenario1.A,sumScenario1.B,x=>summary(x).sum)==="B","scenario 1 cumulative-wait choice should be B");
assert(choose(sumScenario2.A,sumScenario2.B,x=>summary(x).sum)==="A","scenario 2 cumulative-wait choice should be A");

// Counterexample 2: even count + oldest + sum cannot identify threshold-overdue priority.
const twoOverdue=[1200,600,0,0];
const oneOverdue=[1200,300,300,0];
const xS=summary(twoOverdue), yS=summary(oneOverdue);
assert(same(["count","oldest","sum"],xS,yS),"T2 summaries should match");
assert(xS.overdue!==yS.overdue,"hidden overdue counts should differ");

const slaScenario1={A:twoOverdue,B:oneOverdue};
const slaScenario2={A:oneOverdue,B:twoOverdue};
assert(choose(slaScenario1.A,slaScenario1.B,x=>summary(x).overdue)==="A","scenario 1 SLA choice should be A");
assert(choose(slaScenario2.A,slaScenario2.B,x=>summary(x).overdue)==="B","scenario 2 SLA choice should be B");

// Sufficiency checks for the declared snapshot objectives.
assert(summary(thin).oldest===Math.max(...thin),"oldest is sufficient statistic for J_max score");
assert(summary(dense).sum===dense.reduce((a,b)=>a+b,0),"sum is sufficient statistic for J_sum score");
assert(summary(twoOverdue).overdue===twoOverdue.filter(x=>x>=600).length,"overdue count is sufficient for J_tau score");

console.log(JSON.stringify({
  schema:"e050-counterexample-v1",
  tau_seconds:600,
  counterexample_T1_for_Jsum:{
    hidden_states:{thin,dense},
    observed_T1:{thin:{count:thinS.count,oldest:thinS.oldest},dense:{count:denseS.count,oldest:denseS.oldest}},
    hidden_sums:{thin:thinS.sum,dense:denseS.sum},
    conclusion:"Same count+oldest can imply opposite J_sum allocation decisions."
  },
  counterexample_T2_for_Jtau:{
    hidden_states:{twoOverdue,oneOverdue},
    observed_T2:{
      twoOverdue:{count:xS.count,oldest:xS.oldest,sum:xS.sum},
      oneOverdue:{count:yS.count,oldest:yS.oldest,sum:yS.sum}
    },
    hidden_overdue_counts:{twoOverdue:xS.overdue,oneOverdue:yS.overdue},
    conclusion:"Same count+oldest+sum can imply opposite J_tau allocation decisions."
  },
  sufficient_by_declared_objective:{
    J_max:"oldest_wait_seconds",
    J_sum:"queue_wait_sum_seconds",
    J_tau:"overdue_count at the declared tau"
  },
  overall:"There is no objective-independent minimal temporal summary."
},null,2));
