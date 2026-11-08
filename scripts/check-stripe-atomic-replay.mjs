import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProcessor } from '../experiments/stripe-ordering/processor.mjs';
import { SqliteStore } from '../experiments/stripe-ordering/sqlite-store.mjs';

const e = (id, created, type = 'customer.subscription.updated', subscription = 'sub_test') =>
  ({ id, created, type, subscription, verified: true, correlated: true, payloadHash: `fixture-${id}` });
const s = (status = 'active', end = 900, cancel = false) =>
  ({ id: 'sub_test', status, current_period_start: 100, current_period_end: end, cancel_at_period_end: cancel });
let count = 0;
async function test(label, fn) { await fn(); console.log(`PASS ${++count} ${label}`); }
async function fixture(fn) {
  const store = new SqliteStore();
  let authoritative = s();
  const process = createProcessor({ store, retrieveSubscription: async () => authoritative });
  try { await fn({ store, process, set: value => { authoritative = value; } }); }
  finally { store.close(); }
}

await test('older deleted event cannot overwrite a newer active row or access', () => fixture(async ({store,process}) => {
  await process(e('evt_active', 300));
  assert.equal(await process(e('evt_old', 200, 'customer.subscription.deleted')), 'stale');
  assert.equal(store.read('sub_test').status, 'active'); assert.equal(store.access('sub_test', 500), true);
}));
await test('old AND newer paid invoices cannot resurrect a canceled subscription', () => fixture(async ({store,process,set}) => {
  set(s('canceled')); await process(e('evt_cancel', 300));
  assert.equal(await process(e('evt_oldpaid', 250, 'invoice.paid')), 'stale');
  await process(e('evt_newpaid', 400, 'invoice.paid'));
  assert.equal(store.read('sub_test').status, 'canceled'); assert.equal(store.access('sub_test', 500), false);
}));
await test('duplicate event has exactly one committed effect', () => fixture(async ({store,process}) => {
  const event = e('evt_repeat', 200); await process(event);
  assert.equal(await process(event), 'duplicate');
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM effects').get().n, 1);
}));
await test('same-second conflict uses authoritative state', () => fixture(async ({store,process,set}) => {
  await process(e('evt_a', 200)); set(s('canceled'));
  await process(e('evt_b', 200)); assert.equal(store.read('sub_test').status, 'canceled');
}));
await test('failed reconciliation remains retryable without receipt consumption', () => fixture(async ({store,process,set}) => {
  await process(e('evt_a', 200)); set(null);
  await assert.rejects(process(e('evt_b', 200)), /invalid_subscription_snapshot/);
  assert.equal(store.receipt('evt_b'), null); assert.equal(store.read('sub_test').status, 'active');
  set(s('canceled')); await process(e('evt_b', 200)); assert.equal(store.read('sub_test').status, 'canceled');
}));
await test('stale invoice cannot regress billing period', () => fixture(async ({store,process}) => {
  await process(e('evt_new', 400, 'invoice.paid')); await process(e('evt_old', 300, 'invoice.paid'));
  assert.equal(store.read('sub_test').periodEnd, 900);
}));
await test('scheduled cancellation keeps access exactly through paid period', () => fixture(async ({store,process,set}) => {
  set(s('active', 900, true)); await process(e('evt_schedule', 400));
  assert.equal(store.read('sub_test').cancelAtPeriodEnd, true);
  assert.equal(store.access('sub_test', 899), true); assert.equal(store.access('sub_test', 900), false);
}));
await test('failure after writes rolls back subscription, receipt and entitlement; retry succeeds once', () => fixture(async ({store,process}) => {
  store.beforeComplete = () => { throw new Error('database_failure'); };
  await assert.rejects(process(e('evt_fail', 400)), /database_failure/);
  assert.equal(store.read('sub_test'), null); assert.equal(store.receipt('evt_fail'), null);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM entitlements').get().n, 0);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM effects').get().n, 0);
  store.beforeComplete = null; await process(e('evt_fail', 400));
  assert.equal(await process(e('evt_fail', 400)), 'duplicate');
}));
await test('delayed authoritative response is fenced by revision and retried', () => fixture(async ({store,process,set}) => {
  let release, started;
  const ready = new Promise(resolve => { started = resolve; });
  const delayed = createProcessor({ store, retrieveSubscription: () => {
    started(); return new Promise(resolve => { release = () => resolve(s()); });
  } });
  const old = delayed(e('evt_slow', 200)); await ready;
  set(s('canceled')); await process(e('evt_fast', 300)); release();
  assert.equal(await old, 'stale'); assert.equal(store.read('sub_test').status, 'canceled');
}));
await test('Checkout placeholder cannot clear cancellation or downgrade lifecycle state', () => fixture(async ({store,process,set}) => {
  set(s('active', 900, true)); await process(e('evt_active', 300));
  await process(e('evt_checkout', 400, 'checkout.session.completed'));
  assert.equal(store.read('sub_test').status, 'active'); assert.equal(store.read('sub_test').cancelAtPeriodEnd, true);
}));
await test('failed invoice uses current subscription rather than revoking recovered access', () => fixture(async ({store,process}) => {
  await process(e('evt_failure', 300, 'invoice.payment_failed'));
  assert.equal(store.read('sub_test').status, 'active');
}));
await test('invalid clocks, correlation and snapshot identity fail closed', () => fixture(async ({store,process,set}) => {
  for (const patch of [{created:0},{verified:false},{correlated:false},{subscription:'wrong'}])
    await assert.rejects(process({...e('evt_bad', 300),...patch}), /invalid_verified_event/);
  set({...s(),id:'sub_other'}); await assert.rejects(process(e('evt_bad', 300)), /invalid_subscription_snapshot/);
  assert.equal(store.read('sub_test'), null);
}));
await test('duplicate identity with changed payload is rejected', () => fixture(async ({process}) => {
  await process(e('evt_a', 300));
  await assert.rejects(process({...e('evt_a', 300),payloadHash:'different'}), /event_identity_conflict/);
}));
await test('Stripe retrieval failure leaves no partially applied state', () => fixture(async ({store}) => {
  const process = createProcessor({store,retrieveSubscription:async()=>{throw new Error('stripe_unavailable');}});
  await assert.rejects(process(e('evt_network',300)), /stripe_unavailable/);
  assert.equal(store.read('sub_test'), null); assert.equal(store.receipt('evt_network'), null);
}));
await test('terminal-state inconsistency fails closed and remains retryable', () => fixture(async ({store,process,set}) => {
  set(s('canceled')); await process(e('evt_terminal',300)); set(s());
  await assert.rejects(process(e('evt_conflict',400)), /terminal_subscription_conflict/);
  assert.equal(store.receipt('evt_conflict'), null); assert.equal(store.read('sub_test').status,'canceled');
}));
await test('concurrent duplicate deliveries commit one effect', () => fixture(async ({store,process}) => {
  const results = await Promise.all([process(e('evt_race',300)), process(e('evt_race',300))]);
  assert.deepEqual(results.sort(), ['applied','duplicate']);
  assert.equal(store.db.prepare('SELECT count(*) AS n FROM effects').get().n,1);
}));
await test('durable receipt survives closing and reopening isolated database', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'runlu-stripe-'));
  let store;
  try {
    const path = join(dir, 'isolated.sqlite'); store = new SqliteStore(path);
    await createProcessor({store,retrieveSubscription:async()=>s()})(e('evt_disk',300)); store.close();
    store = new SqliteStore(path);
    assert.equal(await createProcessor({store,retrieveSubscription:async()=>{throw new Error('must not fetch');}})(e('evt_disk',300)), 'duplicate');
    assert.equal(store.read('sub_test').status, 'active');
  } finally { store?.close(); rmSync(dir,{recursive:true,force:true}); }
});
console.log(`PASS ${count} isolated SQLite atomic replay scenarios (no external services)`);
