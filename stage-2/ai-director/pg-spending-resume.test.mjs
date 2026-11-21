import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorSpendingResume} from './pg-spending-resume.mjs';
const input={episodeId:'ep1',decisionId:'decision1',reviewerId:'admin1',reason:'Provider charges have been reconciled'};
function mock({paused=true,committed=500,limit=1000,unknown=0,failInsert=false}={}){
 const calls=[];const client={query:async(sql,args=[])=>{
 calls.push({sql,args});
 if(sql.startsWith('SELECT limit_cents'))return {rows:[{limit_cents:limit,spending_paused:paused}]};
 if(sql.startsWith('SELECT COALESCE'))return {rows:[{committed_cents:committed}]};
 if(sql.startsWith('SELECT count(*)'))return {rows:[{count:unknown}]};
 if(sql.startsWith('INSERT')&&failInsert)throw Error('Audit insert failed');
 if(sql.startsWith('UPDATE'))return {rows:[{episode_id:'ep1'}]};
 return {rows:[]};
 },release:()=>calls.push({sql:'RELEASE'})};
 return {calls,pool:{connect:async()=>client}};
}
test('resumes only with reconciled budget and audit decision',async()=>{
 const m=mock();const result=await new PgDirectorSpendingResume(m.pool).resume(input);
 assert.equal(result.state,'ACTIVE');
 assert.equal(m.calls.filter(c=>c.sql==='COMMIT').length,1);
 assert.ok(m.calls.some(c=>c.sql.startsWith('INSERT INTO stage_director_spending_decisions')));
});
test('rejects still-over-budget episode without changing pause',async()=>{
 const m=mock({committed:1100});
 await assert.rejects(new PgDirectorSpendingResume(m.pool).resume(input),/over limit/);
 assert.ok(!m.calls.some(c=>c.sql.startsWith('UPDATE')));
});
test('rejects unknown provider charges',async()=>{
 const m=mock({unknown:1});
 await assert.rejects(new PgDirectorSpendingResume(m.pool).resume(input),/Unknown provider/);
 assert.ok(!m.calls.some(c=>c.sql.startsWith('UPDATE')));
});
test('audit failure rolls back pause change',async()=>{
 const m=mock({failInsert:true});
 await assert.rejects(new PgDirectorSpendingResume(m.pool).resume(input),/Audit insert failed/);
 assert.ok(m.calls.some(c=>c.sql==='ROLLBACK'));
});
test('rejects unpaused episode and insufficient reason',async()=>{
 const m=mock({paused:false});
 await assert.rejects(new PgDirectorSpendingResume(m.pool).resume(input),/not paused/);
 await assert.rejects(new PgDirectorSpendingResume(m.pool).resume({...input,reason:'ok'}),/Invalid/);
});
