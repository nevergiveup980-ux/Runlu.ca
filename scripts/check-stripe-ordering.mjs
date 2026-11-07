import assert from 'node:assert/strict';

// Pure decision model only. This is NOT connected to Stripe or production.
export function decideEvent(current, incoming) {
  if (!incoming?.id || !Number.isSafeInteger(incoming.created) || incoming.created <= 0)
    return 'reconcile';
  if (!current) return 'apply';
  if (incoming.id === current.id) return 'duplicate';
  if (!Number.isSafeInteger(current.created) || current.created <= 0) return 'reconcile';
  if (incoming.created < current.created) return 'stale';
  if (incoming.created > current.created) return 'apply';
  // Stripe event.created has second resolution. Never use arrival order as a tie-breaker.
  return 'reconcile';
}

const cases = [
  ['first event', null, {id:'evt_1',created:100}, 'apply'],
  ['newer event', {id:'evt_1',created:100}, {id:'evt_2',created:101}, 'apply'],
  ['older subscription event', {id:'evt_2',created:101}, {id:'evt_1',created:100}, 'stale'],
  ['late paid invoice', {id:'evt_cancel',created:300}, {id:'evt_paid',created:299}, 'stale'],
  ['same event retry', {id:'evt_1',created:100}, {id:'evt_1',created:100}, 'duplicate'],
  ['same-second conflicting events', {id:'evt_active',created:100}, {id:'evt_cancel',created:100}, 'reconcile'],
  ['missing timestamp', {id:'evt_1',created:100}, {id:'evt_2'}, 'reconcile'],
  ['invalid existing clock', {id:'evt_1',created:0}, {id:'evt_2',created:101}, 'reconcile'],
];
for (const [label,current,incoming,expected] of cases) {
  assert.equal(decideEvent(current,incoming),expected,label);
}
console.log(`PASS ${cases.length} isolated Stripe ordering decision cases`);
