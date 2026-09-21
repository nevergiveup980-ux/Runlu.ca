// RUNLU R001 / E008 — warehouse-native narrow-lane game
export const ACTION={YIELD:0,ENTER:1};

export function outcome(uA,uB,a,b){
 const conflict=a===1&&b===1;
 const deadlock=a===0&&b===0;
 const progress=a!==b;
 let urgentPriority=null;
 if(uA!==uB){
   const urgentA=uA===1;
   urgentPriority=urgentA ? (a===1&&b===0) : (b===1&&a===0);
 }
 return {uA,uB,a,b,conflict,deadlock,progress,urgentPriority};
}

export function payoffTable(){
 const rows=[];
 for(let uA=0;uA<2;uA++)for(let uB=0;uB<2;uB++)
  for(let a=0;a<2;a++)for(let b=0;b<2;b++) rows.push(outcome(uA,uB,a,b));
 return rows;
}

export function localAction(mask,agent,urgency){
 const idx=(agent==="A"?0:2)+urgency;
 return (mask>>idx)&1;
}

export function evaluateDeterministic(mask){
 const rows=[]; let conflict=0,deadlock=0,progress=0,priorityOK=0,priorityN=0;
 for(let uA=0;uA<2;uA++)for(let uB=0;uB<2;uB++){
  const a=localAction(mask,"A",uA),b=localAction(mask,"B",uB);
  const o=outcome(uA,uB,a,b); rows.push(o);
  conflict+=o.conflict; deadlock+=o.deadlock; progress+=o.progress;
  if(o.urgentPriority!==null){priorityN++;priorityOK+=o.urgentPriority;}
 }
 return {mask,conflict:conflict/4,deadlock:deadlock/4,progress:progress/4,
   urgent_priority:priorityN?priorityOK/priorityN:null,rows};
}

export function enumerate(){
 return Array.from({length:16},(_,mask)=>evaluateDeterministic(mask));
}

if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("native_game.js"))
 console.log(JSON.stringify({experiment:"RUNLU-R001-E008",policies:enumerate()},null,2));
