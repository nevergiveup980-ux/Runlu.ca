#!/usr/bin/env node
function cumulative(events){return events.reduce((s,e)=>s+e.d,0);}
function rolling(events,W){return events.filter(e=>e.age<=W).reduce((s,e)=>s+e.d,0);}
function decay(events,H){return events.reduce((s,e)=>s+e.d*Math.pow(2,-e.age/H),0);}
function action(debt,eps=1e-12){return debt>eps?"B":debt<-eps?"A":"TIE";}
function assert(c,m){if(!c)throw new Error(m);}

// Same current state; history contains old A-favoring debt and recent B-favoring debt.
const events=[
  {age:50,d:+8,label:"old A-favoring imbalance"},
  {age:5,d:-3,label:"recent B-favoring imbalance"}
];
const current={eligible_demand_a:10,eligible_demand_b:10,served_in_current_snapshot_a:0,served_in_current_snapshot_b:0};

const C=cumulative(events);
const R10=rolling(events,10);
const R60=rolling(events,60);
const D5=decay(events,5);
const D100=decay(events,100);

assert(action(C)==="B","cumulative should retain old A-favoring debt");
assert(action(R10)==="A","short rolling window should retain only recent B-favoring debt");
assert(action(R60)==="B","long rolling window should retain both");
assert(action(D5)==="A","short half-life should emphasize recent debt");
assert(action(D100)==="B","long half-life should retain old debt strongly enough");

// Session reset shows lifecycle dependence.
const preReset=[{age:2,d:+6}];
const afterResetDebt=0;
assert(action(cumulative(preReset))==="B","pre-reset debt should exist");
assert(action(afterResetDebt)==="TIE","reset clears debt by definition");

console.log(JSON.stringify({
 schema:"e053-memory-horizon-v1",
 current_state:current,
 history:events,
 models:{
  cumulative_session:{debt:C,corrective_preference:action(C)},
  rolling_10:{debt:R10,corrective_preference:action(R10)},
  rolling_60:{debt:R60,corrective_preference:action(R60)},
  exponential_half_life_5:{debt:D5,corrective_preference:action(D5)},
  exponential_half_life_100:{debt:D100,corrective_preference:action(D100)}
 },
 session_lifecycle:{pre_reset_debt:cumulative(preReset),post_reset_debt:afterResetDebt},
 conclusion:"The same history and current state can imply opposite fairness corrections under different memory horizons."
},null,2));
