import assert from 'node:assert/strict';
import { decideEvent } from './check-stripe-ordering.mjs';

// An isolated state-machine replay: no Stripe API, Supabase connection or charges.
function replay(events, reconcile) {
  const state = { clock:null, status:'pending', periodEnd:0, grants:0, seen:new Set(), audit:[] };
  for (const event of events) {
    const action = state.seen.has(event.id) ? 'duplicate' : decideEvent(state.clock,event);
    state.seen.add(event.id);
    state.audit.push([event.id,action]);
    if (action === 'duplicate' || action === 'stale') continue;
    if (action === 'reconcile') {
      const authoritative = reconcile?.(event,state);
      if (!authoritative) continue; // fail closed; do not guess same-second ordering
      state.status = authoritative.status;
      state.periodEnd = authoritative.periodEnd;
      state.clock = {id:event.id,created:event.created};
      continue;
    }
    state.status = event.status;
    state.periodEnd = event.periodEnd;
    state.clock = {id:event.id,created:event.created};
    if (event.status === 'active') state.grants++;
  }
  return state;
}

const active = {id:'evt_active',created:200,status:'active',periodEnd:500};
const canceled = {id:'evt_cancel',created:300,status:'canceled',periodEnd:300};
const olderInvoice = {id:'evt_invoice',created:250,status:'active',periodEnd:600};
let s = replay([active,canceled,olderInvoice]);
assert.equal(s.status,'canceled','old invoice must not reactivate canceled subscription');
assert.equal(s.periodEnd,300,'old invoice must not extend a canceled period');
assert.equal(s.grants,1,'old invoice must not issue a new grant');

s = replay([active,active]);
assert.equal(s.grants,1,'duplicate event must not grant twice');
assert.equal(s.audit[1][1],'duplicate');

s = replay([active,{...canceled,created:200}]);
assert.equal(s.status,'active','same-second conflict must not overwrite state without reconciliation');
assert.equal(s.audit[1][1],'reconcile');

s = replay([active,{...canceled,created:200}],()=>({status:'canceled',periodEnd:200}));
assert.equal(s.status,'canceled','authoritative reconciliation may resolve same-second conflict');

s = replay([{id:'evt_new',created:400,status:'active',periodEnd:900},
            {id:'evt_old',created:350,status:'active',periodEnd:700}]);
assert.equal(s.periodEnd,900,'billing period must never regress from stale event');

console.log('PASS 5 isolated Stripe subscription replay scenarios');
