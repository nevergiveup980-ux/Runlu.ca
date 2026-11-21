import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorRecoveryInventory} from './pg-recovery-inventory.mjs';
function fixture(rows){
 const calls=[];return {calls,pool:{query:async(sql,args)=>{calls.push({sql,args});return {rows}}}};
}
const record={attempt_id:'a1',shot_id:'s1',state:'DISPATCHING',provider_task_id:null,
 updated_at:'2026-11-11T00:00:00Z',attempt_state:'RESERVED',shot_state:'RESERVED'};
test('crash inventory lists uncertain tasks but cannot dispatch them',async()=>{
 const f=fixture([record,{...record,attempt_id:'a2',state:'UNKNOWN'}]);
 const result=await new PgDirectorRecoveryInventory(f.pool).inspect({episodeId:'e1'});
 assert.equal(result.length,2);assert.ok(result.every(r=>r.retryAllowed===false&&r.requiresManualReconciliation));
 assert.match(f.calls[0].sql,/o.state IN \('DISPATCHING','UNKNOWN'\)/);
 assert.doesNotMatch(f.calls[0].sql,/\bUPDATE\b|\bINSERT\b|\bDELETE\b/);
 assert.deepEqual(f.calls[0].args,['e1',300,50]);
});
test('empty inventory is safe and never retries',async()=>{
 const f=fixture([]);assert.deepEqual(await new PgDirectorRecoveryInventory(f.pool).inspect({episodeId:'e1'}),[]);
 assert.equal(f.calls.length,1);
});
test('invalid parameters are rejected before database read',async()=>{
 const f=fixture([]),service=new PgDirectorRecoveryInventory(f.pool);
 await assert.rejects(service.inspect({episodeId:'bad id'}));
 await assert.rejects(service.inspect({episodeId:'e1',olderThanSeconds:0}));
 assert.equal(f.calls.length,0);
});
test('malformed database records fail closed',async()=>{
 const f=fixture([{...record,attempt_id:'bad id'}]);
 await assert.rejects(new PgDirectorRecoveryInventory(f.pool).inspect({episodeId:'e1'}),/Invalid recovery record/);
});
