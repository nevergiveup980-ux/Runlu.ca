import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {createProcessor} from './processor.mjs';
import {RunluStore} from './runlu-store.mjs';
import {createWebhook} from './webhook.mjs';
import {installRunluSnapshot} from './install-runlu-snapshot.mjs';

export async function checkRunluIntegration({admin,exec,service,pool}) {
  await installRunluSnapshot(exec);
  const user='00000000-0000-4000-8000-000000000001';
  const subscription='00000000-0000-4000-8000-000000000002';
  await admin('INSERT INTO auth.users VALUES($1)',[user]);
  await admin("INSERT INTO public.runlu_product_catalog(product_key,name,kind,library_eligible) VALUES('guanshi','Synthetic integration product','software',true)");
  await admin("INSERT INTO public.runlu_product_plans(plan_key,product_key,name,plan_type,price_cad,billing_period,availability) VALUES('lab-monthly','guanshi','Synthetic monthly plan','subscription',1,'month','available')");
  await admin("INSERT INTO public.runlu_provider_adapters(provider_name,implementation_status,normalize_event_ready) VALUES('stripe','ready',true)");
  for(const type of ['subscription_activated','subscription_renewed','subscription.expired','subscription.past_due'])
    await admin("INSERT INTO public.runlu_commerce_event_types(event_type,event_family,target_scope) VALUES($1,'subscription','subscription')",[type]);
  const store=new RunluStore(service);
  const now=Math.floor(Date.now()/1000);
  const hash=value=>createHash('sha256').update(value).digest('hex');
  const e=(id,created=now-50,type='customer.subscription.updated')=>({id,created,type,subscription:'sub_test',verified:true,correlated:true,payloadHash:hash(id)});
  const s=(status='active',cancel=false)=>({id:'sub_test',status,current_period_start:now-1000,current_period_end:now+3600,cancel_at_period_end:cancel});
  const next=status=>({status,periodStart:now-1000,periodEnd:now+3600,cancelAtPeriodEnd:false});
  let authoritative,processEvent,count=0;
  const tables=['runlu_subscriptions','runlu_webhook_receipts','runlu_commerce_events','runlu_entitlements','runlu_entitlement_bases','runlu_entitlement_grants','runlu_entitlement_revocations','runlu_fulfillment_runs','runlu_subscription_status_history'];
  async function reset() {
    await exec('TRUNCATE runlu_stripe_lab.bindings,runlu_stripe_lab.subscriptions,runlu_stripe_lab.receipts,runlu_stripe_lab.entitlements,runlu_stripe_lab.effects,'+tables.map(x=>'public.'+x).join(',')+' CASCADE;');
    await admin("INSERT INTO public.runlu_subscriptions(id,user_id,product_key,plan_key,payment_provider,provider_subscription_reference) VALUES($1,$2,'guanshi','lab-monthly','stripe','sub_test')",[subscription,user]);
    await admin("INSERT INTO runlu_stripe_lab.bindings VALUES('sub_test',$1)",[subscription]);
    authoritative=s(); processEvent=createProcessor({store,retrieveSubscription:async()=>authoritative});
  }
  const n=async table=>Number((await admin(`SELECT count(*) AS n FROM public.${table}`)).rows[0].n);
  const state=async()=>(await admin('SELECT * FROM public.runlu_subscriptions WHERE id=$1',[subscription])).rows[0];
  const effective=async()=>(await admin('SELECT * FROM public.runlu_entitlements WHERE user_id=$1',[user])).rows[0];
  async function test(label,fn) {await reset();await fn();console.log(`PASS RUNLU ${++count} ${label}`);}
  const secret='whsec_SYNTHETIC_RUNLU_RPC_FIXTURE';
  let lastFailure;
  function handler() {return createWebhook({secret,process:async event=>{try{return await processEvent(event);}catch(error){lastFailure=error;throw error;}},correlate:async event=>event.data?.object?.id==='sub_test'?'sub_test':null});}
  function request(id='evt_http') {
    const raw=JSON.stringify({id,created:now-30,type:'customer.subscription.updated',livemode:false,data:{object:{id:'sub_test'}}});
    const signature=createHmac('sha256',secret).update(`${now}.${raw}`).digest('hex');
    return new Request('https://fixture.invalid/webhook',{method:'POST',body:raw,headers:{'stripe-signature':`t=${now},v1=${signature}`}});
  }
  await test('actual record/claim/normalize/fulfillment/complete create matching subscription, basis and access',async()=>{
    assert.equal((await handler()(request())).status,200,lastFailure?.message);
    assert.equal((await state()).status,'active'); assert.equal((await effective()).status,'active');
    for(const table of ['runlu_webhook_receipts','runlu_commerce_events','runlu_entitlement_bases','runlu_entitlement_grants','runlu_fulfillment_runs']) assert.equal(await n(table),1,table);
    assert.equal((await admin('SELECT status,processing_disposition FROM public.runlu_webhook_receipts')).rows[0].status,'processed');
    assert.equal((await handler()(request())).status,200); assert.equal(await n('runlu_fulfillment_runs'),1);
  });
  await test('canceled snapshot obeys real expiration trigger and old/new invoice cannot resurrect entitlement',async()=>{
    await processEvent(e('evt_active',now-100)); authoritative=s('canceled');
    await processEvent(e('evt_cancel',now-80));
    assert.equal((await state()).status,'expired'); assert.equal((await effective()).status,'expired');
    assert.ok(new Date((await state()).current_period_end).getTime()<=Date.now());
    assert.equal(await processEvent(e('evt_oldinvoice',now-90,'invoice.paid')),'stale');
    await processEvent(e('evt_newinvoice',now-60,'invoice.paid'));
    assert.equal((await state()).status,'expired'); assert.notEqual((await effective()).status,'active');
  });
  await test('same-second past-due then recovery uses fenced authority despite legacy type rank',async()=>{
    await processEvent(e('evt_active',now-100)); authoritative=s('past_due');
    await processEvent(e('evt_pastdue',now-50)); assert.equal((await effective()).status,'revoked');
    authoritative=s(); await processEvent(e('evt_recovered',now-50));
    assert.equal((await state()).status,'active'); assert.equal((await effective()).status,'active');
    const {rows}=await admin("SELECT event_status,ordering_status FROM public.runlu_commerce_events WHERE provider_event_id='evt_recovered'");
    assert.equal(rows[0].event_status,'processed'); assert.equal(rows[0].ordering_status,'accepted');
  });
  await test('unmarked legacy same-second recovery remains guarded, no global bypass',async()=>{
    await processEvent(e('evt_active',now-100)); authoritative=s('past_due'); await processEvent(e('evt_due',now-50));
    const id=(await admin("SELECT public.runlu_record_webhook_receipt('stripe','evt_legacy','customer.subscription.updated',$1,true,null) AS id",[hash('legacy')])).rows[0].id;
    await admin('SELECT public.runlu_claim_webhook_receipt($1)',[id]);
    await admin("UPDATE public.runlu_subscriptions SET status='active' WHERE id=$1",[subscription]);
    const event=(await admin("SELECT public.runlu_normalize_webhook_event($1,'subscription_activated',$2,null,$3,'guanshi','lab-monthly',to_timestamp($4),$4::bigint) AS id",[id,user,subscription,now-50])).rows[0].id;
    assert.equal((await admin('SELECT public.runlu_assess_commerce_event_ordering($1) AS status',[event])).rows[0].status,'stale');
  });
  await test('scheduled cancellation grants actual paid-through basis without clearing flag',async()=>{
    authoritative=s('active',true); await processEvent(e('evt_schedule'));
    assert.equal((await state()).cancel_at_period_end,true); assert.equal((await effective()).status,'active');
    assert.equal(Math.floor(new Date((await effective()).ends_at).getTime()/1000),now+3600);
  });
  await test('failure at real receipt completion rolls back all RPCs and clock, then exact retry succeeds',async()=>{
    await exec("CREATE FUNCTION public.lab_receipt_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF new.status='processed' THEN RAISE EXCEPTION 'completion_failure'; END IF; RETURN new; END $$; CREATE TRIGGER lab_fail BEFORE UPDATE ON public.runlu_webhook_receipts FOR EACH ROW EXECUTE FUNCTION public.lab_receipt_failure();");
    try {
      assert.equal((await handler()(request())).status,503); assert.equal((await state()).status,'pending');
      for(const table of tables.filter(x=>x!=='runlu_subscriptions')) assert.equal(await n(table),0,table);
      assert.equal(await store.read('sub_test'),null);
    } finally {await exec('DROP TRIGGER lab_fail ON public.runlu_webhook_receipts; DROP FUNCTION public.lab_receipt_failure();');}
    assert.equal((await handler()(request())).status,200); assert.equal(await n('runlu_entitlement_grants'),1);
  });
  await test('failure inside real entitlement grant leaves no partial subscription or claimed receipt',async()=>{
    await admin("UPDATE public.runlu_product_catalog SET library_eligible=false WHERE product_key='guanshi'");
    try {
      assert.equal((await handler()(request())).status,503); assert.equal((await state()).status,'pending');
      assert.equal(await n('runlu_webhook_receipts'),0); assert.equal(await n('runlu_commerce_events'),0);
    } finally {await admin("UPDATE public.runlu_product_catalog SET library_eligible=true WHERE product_key='guanshi'");}
    assert.equal((await handler()(request())).status,200);
  });
  await test('busy, backoff and manual review remain 503 with real receipt untouched',async()=>{
    for(const mode of ['processing','backoff','review']) {
      await reset();
      const raw=await request().text();
      const id=(await admin("SELECT public.runlu_record_webhook_receipt('stripe','evt_http','customer.subscription.updated',$1,true,null) AS id",[hash(raw)])).rows[0].id;
      if(mode==='processing') await admin("UPDATE public.runlu_webhook_receipts SET status='processing',processing_started_at=now() WHERE id=$1",[id]);
      if(mode==='backoff') await admin("UPDATE public.runlu_webhook_receipts SET next_retry_at=now()+interval '1 hour' WHERE id=$1",[id]);
      if(mode==='review') await admin('UPDATE public.runlu_webhook_receipts SET manual_review_required=true WHERE id=$1',[id]);
      assert.equal((await handler()(request())).status,503,mode);
      assert.equal((await state()).status,'pending'); assert.equal(await store.read('sub_test'),null);
      assert.equal((await admin('SELECT processing_attempt_count FROM public.runlu_webhook_receipts WHERE id=$1',[id])).rows[0].processing_attempt_count,0);
    }
  });
  await test('expired processing claim can recover once with sourced claim function',async()=>{
    const raw=await request().text();
    const id=(await admin("SELECT public.runlu_record_webhook_receipt('stripe','evt_http','customer.subscription.updated',$1,true,null) AS id",[hash(raw)])).rows[0].id;
    await admin("UPDATE public.runlu_webhook_receipts SET status='processing',processing_started_at=now()-interval '16 minutes' WHERE id=$1",[id]);
    assert.equal((await handler()(request())).status,200); assert.equal(await n('runlu_fulfillment_runs'),1);
  });
  await test('missing trusted binding and missing revocation basis fail closed',async()=>{
    authoritative=s('canceled'); await assert.rejects(processEvent(e('evt_nobasis')),/Matching commerce entitlement basis not found/);
    assert.equal((await state()).status,'pending'); assert.equal(await store.read('sub_test'),null);
    await admin('DELETE FROM runlu_stripe_lab.bindings'); authoritative=s();
    await assert.rejects(processEvent(e('evt_unbound')),/trusted_subscription_binding_missing/);
    assert.equal(await n('runlu_webhook_receipts'),0);
  });
  await test('actual source RPCs and integration wrapper deny anonymous/authenticated execution',async()=>{
    for(const role of ['runlu_lab_anon','runlu_lab_authenticated']) {
      for(const fn of ['public.runlu_claim_webhook_receipt(uuid)','public.runlu_orchestrate_fulfillment(uuid)','runlu_stripe_lab.commit_runlu_subscription(jsonb,bigint,jsonb)'])
        assert.equal((await admin('SELECT has_function_privilege($1,$2,\'EXECUTE\') AS allowed',[role,fn])).rows[0].allowed,false);
    }
    await processEvent(e('evt_history')); assert.equal(await n('runlu_subscription_status_history'),1);
    const {rows}=await admin('SELECT from_status,to_status FROM public.runlu_subscription_status_history');
    assert.equal(rows[0].from_status,'pending'); assert.equal(rows[0].to_status,'active');
  });
  if(pool) await test('SERVER concurrent wrappers serialize actual receipt and entitlement RPCs',async()=>{
    assert.deepEqual((await Promise.all([processEvent(e('evt_race')),processEvent(e('evt_race'))])).sort(),['applied','duplicate']);
    assert.equal(await n('runlu_entitlement_grants'),1); assert.equal(await n('runlu_fulfillment_runs'),1);
  });
  if(typeof Deno!=='undefined') await test('DENO Deno.serve verifies signed HTTP and commits sourced RUNLU RPCs',async()=>{
    const server=Deno.serve({hostname:'127.0.0.1',port:0,onListen(){}},handler());
    try {
      const signed=request();
      const response=await fetch(`http://127.0.0.1:${server.addr.port}/webhook`,{
        method:'POST',headers:signed.headers,body:await signed.text(),signal:AbortSignal.timeout(5000)});
      assert.equal(response.status,200); assert.equal((await response.json()).result,'applied');
      assert.equal((await effective()).status,'active'); assert.equal(await n('runlu_fulfillment_runs'),1);
    } finally {await server.shutdown();}
  });
  console.log(`PASS ${count} sourced RUNLU RPC integration scenarios (${pool?'server':'embedded'} PostgreSQL; synthetic data only)`);
}
