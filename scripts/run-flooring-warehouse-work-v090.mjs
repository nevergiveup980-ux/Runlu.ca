import assert from 'node:assert/strict';

function normalize(s){return s==='Scheduled'?'Waiting':s}
function task(po='181626'){return {po,status:'Waiting',events:[]}}
function transition(t,next){
  next=normalize(next);const prev=normalize(t.status);
  const allowed=['Waiting','In Progress','Partial','Picked Up','Ready','Delayed','Completed','Cancelled'];
  assert.ok(allowed.includes(next),'known status');
  if(['Completed','Cancelled'].includes(prev)&&prev!==next)throw new Error('terminal');
  t.status=next;
  if(prev!==next&&next!=='Waiting')t.events.push({from:prev,to:next});
  return t;
}

let assertions=0;
const ok=(fn)=>{fn();assertions++};
const t=task();
ok(()=>assert.equal(t.status,'Waiting'));
ok(()=>assert.equal(t.events.length,0));
transition(t,'In Progress');
ok(()=>assert.equal(t.events.at(-1).to,'In Progress'));
const n=t.events.length;transition(t,'In Progress');
ok(()=>assert.equal(t.events.length,n));
transition(t,'Partial');
ok(()=>assert.equal(t.events.at(-1).to,'Partial'));
transition(t,'Picked Up');
ok(()=>assert.equal(t.events.at(-1).to,'Picked Up'));
transition(t,'Completed');
ok(()=>assert.equal(t.events.at(-1).to,'Completed'));
ok(()=>assert.throws(()=>transition(t,'In Progress'),/terminal/));
const alias=task('319');alias.status='Scheduled';transition(alias,'Waiting');
ok(()=>assert.equal(alias.events.length,0));
const cancelled=task('320');transition(cancelled,'Cancelled');
ok(()=>assert.equal(cancelled.events.at(-1).to,'Cancelled'));

const plans=new Map();
function upsert(po,patch){const old=plans.get(po)||{po,status:'Waiting',supplier:'',items:[]};const started=!['Waiting','Scheduled','Delayed'].includes(normalize(old.status));const next={...old,...patch,status:old.status};if(started){next.items=old.items;next.requestedDate=old.requestedDate}plans.set(po,next);return next}
upsert('181626',{supplier:'Primco',items:[1],requestedDate:'2026-09-08'});upsert('181626',{supplier:'Primco',items:[1,2],requestedDate:'2026-09-09'});
ok(()=>assert.equal(plans.size,1));
ok(()=>assert.equal(plans.get('181626').items.length,2));
plans.get('181626').status='In Progress';upsert('181626',{items:[1,2,3],requestedDate:'2026-09-10'});
ok(()=>assert.equal(plans.get('181626').items.length,2));
ok(()=>assert.equal(plans.get('181626').requestedDate,'2026-09-09'));

console.log(`V0.9.0 Warehouse Work Orchestration: ${assertions}/${assertions} PASS`);
console.log('Rules: one PO one plan; Waiting creates no Activity; execution transitions append facts; retries are idempotent; started work is not silently overwritten.');
