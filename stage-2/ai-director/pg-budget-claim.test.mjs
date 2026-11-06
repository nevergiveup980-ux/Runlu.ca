import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorBudgetClaim} from './pg-budget-claim.mjs';
function mock({limit=1000,committed=0,claim=true,failInsert=false}={}){
 const calls=[];const client={query:async(sql,args=[])=>{
 calls.push({sql,args});
 if(sql.startsWith('SELECT limit_cents'))return {rows:limit===null?[]:[{limit_cents:limit}]};
 if(sql.startsWith('SELECT COALESCE'))return {rows:[{committed_cents:committed}]};
 if(sql.startsWith('UPDATE'))return {rows:claim?[{shot_id:'s1'}]:[]};
 if(sql.startsWith('INSERT')&&failInsert)throw Error('Insert failed');
 return {rows:[]};
 },release:()=>calls.push({sql:'RELEASE'})};
 return {calls,pool:{connect:async()=>client}};
}
const input={episodeId:'e1',shotId:'s1',attemptId:'a1',estimateCents:600};
test('one transaction locks approved budget before claiming and recording attempt',async()=>{
 const m=mock();const result=await new PgDirectorBudgetClaim(m.pool).reserveShot(input);
 assert.equal(result.state,'RESERVED');
 assert.ok(m.calls.find(c=>c.sql.includes('FOR UPDATE')));
 assert.equal(m.calls.filter(c=>c.sql==='COMMIT').length,1);
 assert.equal(m.calls.filter(c=>c.sql.startsWith('INSERT')).length,1);
});
test('unconfirmed and exhausted budget fail without claiming',async()=>{
 for(const opts of [{limit:null},{limit:1000,committed:500}]){
  const m=mock(opts);
  await assert.rejects(new PgDirectorBudgetClaim(m.pool).reserveShot(input));
  assert.equal(m.calls.filter(c=>c.sql.startsWith('UPDATE')).length,0);
  assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));
 }
});
test('competing shot claim and insert failure roll back',async()=>{
 for(const opts of [{claim:false},{failInsert:true}]){
  const m=mock(opts);
  await assert.rejects(new PgDirectorBudgetClaim(m.pool).reserveShot(input));
  assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));
  assert.ok(!m.calls.some(c=>c.sql==='COMMIT'));
 }
});
test('reject invalid cost and identity before database connection',async()=>{
 const m=mock();
 await assert.rejects(new PgDirectorBudgetClaim(m.pool).reserveShot({...input,estimateCents:-1}));
 assert.equal(m.calls.length,0);
});
