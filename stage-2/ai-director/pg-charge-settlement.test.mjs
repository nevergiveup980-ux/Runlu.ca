import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorChargeSettlement} from './pg-charge-settlement.mjs';
const input={episodeId:'e1',attemptId:'a1',chargedCents:450,providerChargeReference:'charge_1',recordedBy:'admin'};
function mock({state='SUBMITTED',limit=1000,used=600,estimate=600,failAudit=false}={}){
 const calls=[];const client={query:async(sql,args=[])=>{
 calls.push({sql,args});
 if(sql.startsWith('SELECT limit_cents'))return {rows:[{limit_cents:limit}]};
 if(sql.startsWith('SELECT state,estimated_cents'))return {rows:[{state,estimated_cents:estimate}]};
 if(sql.startsWith('SELECT COALESCE'))return {rows:[{committed_cents:used}]};
 if(sql.startsWith('INSERT')&&failAudit)throw Error('Audit write failed');
 if(sql.startsWith('UPDATE'))return {rows:[{attempt_id:'a1'}]};
 return {rows:[]};
 },release:()=>calls.push({sql:'RELEASE'})};
 return {calls,pool:{connect:async()=>client}};
}
test('settles actual charge with audit and one commit',async()=>{
 const m=mock();const result=await new PgDirectorChargeSettlement(m.pool).settle(input);
 assert.equal(result.chargedCents,450);
 assert.equal(m.calls.filter(c=>c.sql==='COMMIT').length,1);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,1);
});
test('unknown submission cannot settle without reconciliation',async()=>{
 const m=mock({state:'UNKNOWN'});
 await assert.rejects(new PgDirectorChargeSettlement(m.pool).settle(input),/reconcile/);
 assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));
});
test('over-budget actual charge is audited and flagged rather than discarded',async()=>{
 const m=mock({used:900,estimate:600,limit:1000});
 const result=await new PgDirectorChargeSettlement(m.pool).settle({...input,chargedCents:800});
 assert.equal(result.exceedsApprovedBudget,true);
 assert.equal(result.requiresManualReview,true);
 assert.ok(m.calls.some(c=>c.sql.includes('spending_paused=true')));
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,1);
 assert.equal(m.calls.filter(c=>c.sql==='COMMIT').length,1);
});
test('audit insertion failure rolls back attempt settlement',async()=>{
 const m=mock({failAudit:true});
 await assert.rejects(new PgDirectorChargeSettlement(m.pool).settle(input));
 assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));
 assert.ok(!m.calls.some(c=>c.sql==='COMMIT'));
});

test('already settled attempt is not charged or audited twice',async()=>{
 const m=mock({state:'SETTLED'});
 await assert.rejects(new PgDirectorChargeSettlement(m.pool).settle(input),/not confirmed submitted/);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,0);
 assert.equal(m.calls.filter(c=>c.sql==='COMMIT').length,0);
 assert.equal(m.calls.at(-2).sql,'ROLLBACK');
 assert.equal(m.calls.at(-1).sql,'RELEASE');
});
test('unknown provider result never creates charge audit',async()=>{
 const m=mock({state:'UNKNOWN'});
 await assert.rejects(new PgDirectorChargeSettlement(m.pool).settle(input),/reconcile/);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,0);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('UPDATE')).length,0);
});
test('inconsistent committed amount below current reservation fails closed',async()=>{
 const m=mock({used:200,estimate:600});
 await assert.rejects(new PgDirectorChargeSettlement(m.pool).settle(input),/Invalid stored budget amounts/);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,0);
 assert.equal(m.calls.at(-2).sql,'ROLLBACK');
});
test('settlement arithmetic overflow fails before any audit write',async()=>{
 const m=mock({limit:Number.MAX_SAFE_INTEGER,used:Number.MAX_SAFE_INTEGER,estimate:600});
 await assert.rejects(new PgDirectorChargeSettlement(m.pool).settle({...input,chargedCents:800}),/Invalid stored budget amounts/);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,0);
});
