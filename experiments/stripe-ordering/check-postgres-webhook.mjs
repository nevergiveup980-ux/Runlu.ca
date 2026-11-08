import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash, createHmac } from 'node:crypto';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createProcessor } from './processor.mjs';
import { PostgresStore } from './postgres-store.mjs';
import { createWebhook } from './webhook.mjs';

// No Supabase URL, Stripe key, or production environment variable is used.
// Network mode is restricted to a fresh, explicitly named loopback CI database.
const connection = process.env.RUNLU_STRIPE_LAB_DATABASE_URL;
let admin, service, close, pool, embedded;
if (connection) {
  const url = new URL(connection);
  assert.equal(url.protocol,'postgresql:'); assert.equal(url.hostname,'127.0.0.1');
  assert.equal(url.pathname,'/runlu_stripe_lab'); assert.equal(url.username,'runlu_lab_owner');
  assert.equal(url.search,'');
  const {Pool,Client} = await import('pg');
  const owner = new Client({connectionString:connection}); await owner.connect();
  admin = (sql,params) => owner.query(sql,params);
  assert.equal((await admin("SELECT count(*) AS n FROM pg_namespace WHERE nspname='runlu_stripe_lab'")).rows[0].n,'0','lab schema must not already exist');
  pool = new Pool({connectionString:connection,max:8,connectionTimeoutMillis:5000,statement_timeout:10000});
  service = async (sql,params) => {
    const client = await pool.connect();
    try {
      await client.query('SET ROLE runlu_lab_service');
      return await client.query(sql,params);
    } finally { await client.query('RESET ROLE'); client.release(); }
  };
  close = async () => { await pool.end(); await owner.end(); };
  console.log('ENGINE PostgreSQL server, independent pooled connections');
} else {
  const {PGlite} = await import('@electric-sql/pglite');
  embedded = new PGlite(); await embedded.waitReady;
  admin = (sql,params) => embedded.query(sql,params);
  service = (sql,params) => embedded.transaction(async tx => {
    await tx.query('SET LOCAL ROLE runlu_lab_service'); return tx.query(sql,params);
  });
  close = () => embedded.close();
  console.log('ENGINE PGlite embedded PostgreSQL (single connection; server lock tests require CI mode)');
}
const schema = await readFile(new URL('./lab-schema.sql',import.meta.url),'utf8');
if (embedded) await embedded.exec(schema); else await admin(schema);
console.log('Postgres version:',(await admin('SELECT version() AS version')).rows[0].version);
const store = new PostgresStore(service);
const hash = value => createHash('sha256').update(value).digest('hex');
const event = (id,created,type='customer.subscription.updated',ref='sub_test') =>
  ({id,created,type,subscription:ref,verified:true,correlated:true,payloadHash:hash(id)});
const snapshot = (status='active',end=900,cancel=false) =>
  ({id:'sub_test',status,current_period_start:100,current_period_end:end,cancel_at_period_end:cancel});
let authoritative, processor, count=0;
async function reset() {
  await admin('TRUNCATE runlu_stripe_lab.receipts,runlu_stripe_lab.effects,runlu_stripe_lab.entitlements,runlu_stripe_lab.subscriptions');
  authoritative=snapshot();
  processor=createProcessor({store,retrieveSubscription:async()=>authoritative});
}
async function test(label,fn) { await reset(); await fn(); console.log(`PASS ${++count} ${label}`); }
const n = async table => Number((await admin(`SELECT count(*) AS n FROM runlu_stripe_lab.${table}`)).rows[0].n);
const access = async time => (await service('SELECT active AND expires > $1 AS allowed FROM runlu_stripe_lab.entitlements WHERE ref=$2',[time,'sub_test'])).rows[0]?.allowed ?? false;
const secret='whsec_SYNTHETIC_LOCAL_FIXTURE_ONLY';
const clock=1800000000000;
const makeHandler = () => createWebhook({secret,process:processor,now:()=>clock,correlate:async e => {
  const object=e.data?.object;
  // Synthetic server-owned allowlist; ignores metadata and accepts no user ID.
  const ref=e.type.startsWith('customer.subscription.')?object?.id:object?.subscription;
  return ref==='sub_test'?ref:null;
}});
function body(id='evt_http',created=300,type='customer.subscription.updated') {
  return {id,created,type,livemode:false,data:{object:type.startsWith('customer.subscription.')?{id:'sub_test'}:{subscription:'sub_test'}}};
}
function request(value,options={}) {
  const raw=typeof value==='string'?value:JSON.stringify(value);
  const timestamp=options.timestamp??clock/1000;
  const signature=createHmac('sha256',options.secret??secret).update(`${timestamp}.${raw}`).digest('hex');
  return new Request('https://fixture.invalid/webhook',{method:'POST',body:raw,headers:{'stripe-signature':`t=${timestamp},v1=${signature}`}});
}
try {
  await test('older lifecycle event cannot overwrite newer subscription or entitlement',async()=>{
    await processor(event('evt_new',300)); authoritative=snapshot('canceled');
    assert.equal(await processor(event('evt_old',200,'customer.subscription.deleted')),'stale');
    assert.equal((await store.read('sub_test')).status,'active'); assert.equal(await access(500),true);
  });
  await test('old and newer invoice.paid cannot reactivate canceled subscription',async()=>{
    authoritative=snapshot('canceled'); await processor(event('evt_cancel',300));
    assert.equal(await processor(event('evt_old',200,'invoice.paid')),'stale');
    await processor(event('evt_new',400,'invoice.paid'));
    assert.equal((await store.read('sub_test')).status,'canceled'); assert.equal(await access(500),false);
  });
  await test('same-second events reconcile current status without event ID tie-break',async()=>{
    await processor(event('evt_z',300)); authoritative=snapshot('canceled');
    await processor(event('evt_a',300)); assert.equal((await store.read('sub_test')).status,'canceled');
  });
  await test('unresolved reconciliation is unconsumed and retryable',async()=>{
    await processor(event('evt_a',300)); authoritative=null;
    await assert.rejects(processor(event('evt_b',300)),/invalid_subscription_snapshot/);
    assert.equal(await store.receipt('evt_b'),null); authoritative=snapshot('canceled');
    await processor(event('evt_b',300)); assert.equal((await store.read('sub_test')).status,'canceled');
  });
  await test('duplicate and concurrent duplicate produce one effect',async()=>{
    const e=event('evt_same',300);
    assert.deepEqual((await Promise.all([processor(e),processor(e)])).sort(),['applied','duplicate']);
    assert.equal(await n('effects'),1); assert.equal(await n('receipts'),1);
  });
  await test('late invoice cannot regress period',async()=>{
    await processor(event('evt_new',400,'invoice.paid')); authoritative=snapshot('active',700);
    await processor(event('evt_old',300,'invoice.paid')); assert.equal((await store.read('sub_test')).periodEnd,900);
  });
  await test('scheduled cancellation retains access until exclusive paid-through end',async()=>{
    authoritative=snapshot('active',900,true); await processor(event('evt_schedule',400));
    assert.equal((await store.read('sub_test')).cancelAtPeriodEnd,true);
    assert.equal(await access(899),true); assert.equal(await access(900),false);
  });
  await test('Postgres trigger failure after state writes rolls everything back; retry succeeds',async()=>{
    await admin(`CREATE FUNCTION runlu_stripe_lab.inject_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected_database_failure'; END $$`);
    await admin('CREATE TRIGGER lab_failure BEFORE INSERT ON runlu_stripe_lab.receipts FOR EACH ROW EXECUTE FUNCTION runlu_stripe_lab.inject_failure()');
    try {
      const response=await makeHandler()(request(body())); assert.equal(response.status,503);
      for(const table of ['subscriptions','receipts','effects','entitlements']) assert.equal(await n(table),0,table);
    } finally {
      await admin('DROP TRIGGER lab_failure ON runlu_stripe_lab.receipts');
      await admin('DROP FUNCTION runlu_stripe_lab.inject_failure()');
    }
    assert.equal((await makeHandler()(request(body()))).status,200); assert.equal(await n('effects'),1);
  });
  await test('in-flight stale API response loses CAS and cannot overwrite newer commit',async()=>{
    let release,started; const ready=new Promise(resolve=>{started=resolve;});
    const slow=createProcessor({store,retrieveSubscription:async()=>{started(); return new Promise(resolve=>{release=()=>resolve(snapshot());});}});
    const pending=slow(event('evt_slow',200)); await ready;
    authoritative=snapshot('canceled'); await processor(event('evt_fast',300)); release();
    assert.equal(await pending,'stale'); assert.equal((await store.read('sub_test')).status,'canceled');
  });
  await test('Checkout cannot clear cancellation, failure invoice cannot revoke recovered access',async()=>{
    authoritative=snapshot('active',900,true);
    await processor(event('evt_checkout',300,'checkout.session.completed'));
    await processor(event('evt_failed',400,'invoice.payment_failed'));
    assert.equal((await store.read('sub_test')).cancelAtPeriodEnd,true); assert.equal(await access(500),true);
  });
  await test('RPC independently refuses stale revision and null snapshot on fresh event',async()=>{
    await processor(event('evt_first',300));
    assert.equal(await store.commit({event:event('evt_conflict',400),expectedRevision:0,next:{status:'active'}}),'conflict');
    await assert.rejects(store.commit({event:event('evt_null',400),expectedRevision:1,next:null}),/invalid_subscription_snapshot/);
    assert.equal(await store.receipt('evt_null'),null);
  });
  await test('terminal state and changed payload cannot bypass RPC validation',async()=>{
    authoritative=snapshot('canceled'); const e=event('evt_terminal',300); await processor(e);
    await assert.rejects(store.commit({event:{...e,payloadHash:hash('tampered')},expectedRevision:1,next:null}),/event_identity_conflict/);
    await assert.rejects(store.commit({event:event('evt_resurrect',400),expectedRevision:1,next:{status:'active',periodStart:100,periodEnd:900,cancelAtPeriodEnd:false}}),/terminal_subscription_conflict/);
  });
  await test('RPC is invoker-only and PUBLIC/anonymous/authenticated cannot execute or read',async()=>{
    const {rows}=await admin(`SELECT prosecdef FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='runlu_stripe_lab' AND proname='commit_subscription'`);
    assert.equal(rows[0].prosecdef,false);
    for(const role of ['runlu_lab_anon','runlu_lab_authenticated']) {
      assert.equal((await admin("SELECT has_function_privilege($1,'runlu_stripe_lab.commit_subscription(jsonb,bigint,jsonb)','EXECUTE') AS allowed",[role])).rows[0].allowed,false);
      await admin(`SET ROLE ${role}`);
      try {
        await assert.rejects(admin('SELECT * FROM runlu_stripe_lab.subscriptions'),/permission denied/);
        await assert.rejects(admin("SELECT runlu_stripe_lab.commit_subscription('{}',0,null)"),/permission denied/);
      } finally { await admin('RESET ROLE'); }
    }
    assert.equal(Number((await admin("SELECT count(*) AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='runlu_stripe_lab' AND c.relkind='r' AND c.relrowsecurity")).rows[0].n),4);
  });
  await test('HTTP verified signature applies all six supported event routes',async()=>{
    for(const [i,type] of ['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed','checkout.session.completed'].entries()) {
      assert.equal((await makeHandler()(request(body(`evt_route${i}`,300+i,type)))).status,200,type);
    }
    assert.equal(await n('receipts'),6);
  });
  await test('HTTP invalid signature and expired timestamp make zero database writes',async()=>{
    const handler=makeHandler();
    assert.equal((await handler(request(body(),{secret:'wrong'}))).status,400);
    assert.equal((await handler(request(body(),{timestamp:clock/1000-301}))).status,400);
    assert.equal((await handler(request('{bad json'))).status,400);
    assert.equal(await n('receipts'),0);
  });
  await test('HTTP refuses live-mode and forged metadata correlation',async()=>{
    const handler=makeHandler(); assert.equal((await handler(request({...body(),livemode:true}))).status,400);
    const value=body(); value.data.object={id:'sub_unknown',metadata:{runlu_user_id:'forged'}};
    assert.equal((await handler(request(value))).status,503); assert.equal(await n('subscriptions'),0);
  });
  await test('HTTP transient retrieval failure returns 503; exact retry finishes once',async()=>{
    let fail=true;
    processor=createProcessor({store,retrieveSubscription:async()=>{if(fail)throw new Error('unavailable'); return snapshot();}});
    const handler=makeHandler(); assert.equal((await handler(request(body()))).status,503);
    assert.equal(await n('receipts'),0); fail=false;
    assert.equal((await handler(request(body()))).status,200);
    assert.equal((await (await handler(request(body()))).json()).result,'duplicate');
    assert.equal(await n('effects'),1);
  });
  await test('HTTP signed event identity collision remains failure, never duplicate success',async()=>{
    const handler=makeHandler(); await handler(request(body()));
    assert.equal((await handler(request({...body(),extra:'changed'}))).status,503);
    assert.equal(await n('effects'),1);
  });
  await test('loopback HTTP request verifies signature and commits through PostgreSQL adapter',async()=>{
    const handler=makeHandler();
    const server=createServer(async(req,res)=>{
      try {
        const chunks=[]; for await(const chunk of req) chunks.push(chunk);
        const response=await handler(new Request('https://fixture.invalid/webhook',{
          method:req.method,headers:req.headers,body:Buffer.concat(chunks)}));
        res.writeHead(response.status,Object.fromEntries(response.headers)); res.end(await response.text());
      } catch { res.writeHead(500); res.end(); }
    });
    server.listen(0,'127.0.0.1'); await once(server,'listening');
    try {
      const signed=request(body());
      const response=await fetch(`http://127.0.0.1:${server.address().port}/webhook`,{
        method:'POST',headers:signed.headers,body:await signed.text(),signal:AbortSignal.timeout(5000)});
      assert.equal(response.status,200); assert.equal((await response.json()).result,'applied');
      assert.equal(await n('effects'),1);
    } finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
  });
  if (pool) {
    await test('SERVER absent-row concurrent first creation is fenced across sessions',async()=>{
      const next={status:'active',periodStart:100,periodEnd:900,cancelAtPeriodEnd:false};
      const results=await Promise.all(['evt_createA','evt_createB'].map(id=>store.commit({event:event(id,300),expectedRevision:0,next})));
      assert.deepEqual(results.sort(),['applied','conflict']);
      assert.equal(await n('subscriptions'),1); assert.equal(await n('effects'),1);
    });
    await test('SERVER locked/busy receipt returns 503 and is not acknowledged as duplicate',async()=>{
      const lock=await pool.connect();
      try {
        await lock.query('BEGIN');
        await lock.query("SELECT pg_advisory_xact_lock(hashtextextended('event:evt_http',0))");
        const timed=new PostgresStore(async(sql,params)=>{
          const client=await pool.connect();
          try { await client.query("SET lock_timeout='100ms'"); await client.query('SET ROLE runlu_lab_service'); return await client.query(sql,params); }
          finally { await client.query('RESET ROLE'); await client.query('RESET lock_timeout'); client.release(); }
        });
        processor=createProcessor({store:timed,retrieveSubscription:async()=>snapshot()});
        assert.equal((await makeHandler()(request(body()))).status,503); assert.equal(await n('receipts'),0);
      } finally { await lock.query('ROLLBACK'); lock.release(); }
      assert.equal((await makeHandler()(request(body()))).status,200);
    });
    await test('SERVER connection death aborts partially processed work; retry completes',async()=>{
      // A killed connection must never be released into the shared pool while
      // its asynchronous FATAL notification is still in flight.
      const {Client}=await import('pg');
      const client=new Client({connectionString:connection}); await client.connect();
      let crashError;
      const ended=new Promise(resolve=>client.once('end',resolve));
      client.on('error',error=>{crashError=error;});
      try {
        await client.query('BEGIN');
        await client.query('SET LOCAL ROLE runlu_lab_service');
        await client.query('SELECT runlu_stripe_lab.commit_subscription($1,0,$2)',[
          JSON.stringify(event('evt_crash',300)),JSON.stringify({status:'active',periodStart:100,periodEnd:900,cancelAtPeriodEnd:false})]);
        const pid=(await client.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
        await admin('SELECT pg_terminate_backend($1)',[pid]);
        await ended;
        assert.equal(crashError?.code,'57P01');
      } finally { await client.end(); }
      assert.equal(await n('subscriptions'),0); assert.equal(await n('effects'),0); assert.equal(await n('receipts'),0);
      await processor(event('evt_crash',300)); assert.equal(await n('effects'),1);
    });
  }
  console.log(`PASS ${count} ${pool?'server PostgreSQL':'embedded PostgreSQL'} transaction and signed HTTP scenarios`);
} finally { await close(); }
