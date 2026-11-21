import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorProviderPreflight} from './pg-provider-preflight.mjs';
const ids={episodeId:'e1',shotId:'s1',attemptId:'a1'};
function mock({paused=false,missing=false}={}){
 const calls=[];const client={query:async(sql)=>{
  calls.push(sql);
  if(sql.includes('SELECT spending_paused'))return {rows:missing?[]:[{spending_paused:paused}]};
  if(sql.includes('SELECT o.attempt_id'))return {rows:missing?[]:[{attempt_id:'a1'}]};
  return {rows:[]};
 },release:()=>calls.push('RELEASE')};
 return {calls,pool:{connect:async()=>client}};
}
test('preflight locks budget and validates all three task states',async()=>{
 const m=mock();const result=await new PgDirectorProviderPreflight(m.pool).authorize(ids);
 assert.equal(result.authorized,true);
 assert.match(m.calls[1],/FOR UPDATE/);
 assert.match(m.calls[2],/o.state='DISPATCHING'/);
 assert.match(m.calls[2],/s.attempt_id=\$1/);
 assert.ok(m.calls.includes('COMMIT'));
});
test('paused budget blocks before task query',async()=>{
 const m=mock({paused:true});
 await assert.rejects(new PgDirectorProviderPreflight(m.pool).authorize(ids),/spending paused/);
 assert.equal(m.calls.some(s=>s.includes('SELECT o.attempt_id')),false);
 assert.ok(m.calls.includes('ROLLBACK'));
 assert.equal(m.calls.at(-1),'RELEASE');
});
test('missing attempt fails closed',async()=>{
 const m=mock({missing:true});
 await assert.rejects(new PgDirectorProviderPreflight(m.pool).authorize(ids),/blocked/);
 assert.ok(!m.calls.includes('COMMIT'));
});
test('invalid identity does not connect',async()=>{
 const m=mock();await assert.rejects(new PgDirectorProviderPreflight(m.pool).authorize({...ids,attemptId:'bad id'}));
 assert.equal(m.calls.length,0);
});
