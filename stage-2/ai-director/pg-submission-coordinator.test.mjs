import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorSubmissionCoordinator} from './pg-submission-coordinator.mjs';
const input={episodeId:'e1',shotId:'s1',attemptId:'a1',providerTaskId:'provider_1'};
function mock({failAt=Infinity,missingAt=Infinity}={}){
 let n=0;const calls=[];const client={query:async(sql,args=[])=>{
 calls.push({sql,args});if(sql.startsWith('UPDATE')){n++;if(n===failAt)throw Error('DB failure');return {rows:n===missingAt?[]:[{attempt_id:'a1',shot_id:'s1'}]};}
 return {rows:[]};
 },release:()=>calls.push({sql:'RELEASE'})};
 return {calls,pool:{connect:async()=>client}};
}
test('provider acknowledgement updates all three records in one transaction',async()=>{
 const m=mock();const result=await new PgDirectorSubmissionCoordinator(m.pool).acknowledge(input);
 assert.equal(result.state,'SUBMITTED');
 assert.equal(m.calls.filter(c=>c.sql.startsWith('UPDATE')).length,3);
 assert.equal(m.calls.filter(c=>c.sql==='COMMIT').length,1);
});
test('unknown outcome blocks retry and updates all records together',async()=>{
 const m=mock();const result=await new PgDirectorSubmissionCoordinator(m.pool).flagUnknown(input);
 assert.equal(result.retryAllowed,false);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('UPDATE')).length,3);
 assert.ok(m.calls.some(c=>c.sql==='COMMIT'));
});
test('missing linked record and database errors roll back',async()=>{
 for(const opts of [{missingAt:2},{failAt:3}]){
  const m=mock(opts);
  await assert.rejects(new PgDirectorSubmissionCoordinator(m.pool).acknowledge(input));
  assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));
  assert.ok(!m.calls.some(c=>c.sql==='COMMIT'));
 }
});
test('invalid identity is rejected before database access',async()=>{
 const m=mock();
 await assert.rejects(new PgDirectorSubmissionCoordinator(m.pool).acknowledge({...input,providerTaskId:''}));
 assert.equal(m.calls.length,0);
});
