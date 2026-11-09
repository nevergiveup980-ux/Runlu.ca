import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorDashboard} from './pg-director-dashboard.mjs';
function mock({missing=false,paused=false,unknown=false}={}){
 const calls=[];const client={query:async(sql,args=[])=>{
 calls.push({sql,args});
 if(sql.includes('FROM stage_director_budgets b'))return {rows:missing?[]:[{episode_id:'ep1',limit_cents:1000,spending_paused:paused,pause_reason:paused?'Overcharge':null,confirmed_by:'owner',reviewer_id:'editor'}]};
 if(sql.includes('FROM stage_director_shot_jobs'))return {rows:[{shot_id:'s1',state:'SUBMITTED',attempt_id:'a1',output_asset_id:null,updated_at:null}]};
 if(sql.includes('FROM stage_director_attempts a'))return {rows:[{attempt_id:'a1',shot_id:'s1',state:unknown?'UNKNOWN':'SETTLED',estimated_cents:600,charged_cents:unknown?null:450,submission_state:unknown?'UNKNOWN':'SUBMITTED',provider_task_id:'p1',exceeds_approved_budget:false}]};
 return {rows:[]};
 },release:()=>calls.push({sql:'RELEASE'})};
 return {calls,pool:{connect:async()=>client}};
}
test('read-only snapshot shows budget, shots and charges',async()=>{
 const m=mock();const d=await new PgDirectorDashboard(m.pool).getEpisode({episodeId:'ep1'});
 assert.equal(d.budget.remainingCents,550);
 assert.equal(d.shots[0].state,'SUBMITTED');
 assert.equal(d.attempts[0].chargedCents,450);
 assert.ok(m.calls.some(c=>c.sql.includes('REPEATABLE READ READ ONLY')));
 assert.ok(!m.calls.some(c=>/^INSERT|^UPDATE|^DELETE/.test(c.sql)));
});
test('paused and uncertain attempts raise attention flags',async()=>{
 const d=await new PgDirectorDashboard(mock({paused:true,unknown:true}).pool).getEpisode({episodeId:'ep1'});
 assert.equal(d.alerts.requiresAttention,true);
 assert.equal(d.alerts.unknownProviderOutcome,true);
 assert.equal(d.budget.remainingCents,400);
});
test('missing episode and invalid identity fail closed',async()=>{
 await assert.rejects(new PgDirectorDashboard(mock({missing:true}).pool).getEpisode({episodeId:'ep1'}),/not found/);
 await assert.rejects(new PgDirectorDashboard(mock().pool).getEpisode({episodeId:'bad id'}),/Invalid/);
});

test('read transaction commits before releasing connection',async()=>{
 const m=mock();await new PgDirectorDashboard(m.pool).getEpisode({episodeId:'ep1'});
 const sql=m.calls.map(x=>x.sql);
 assert.match(sql[0],/BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY/);
 assert.equal(sql.at(-2),'COMMIT');assert.equal(sql.at(-1),'RELEASE');
 assert.equal(sql.includes('ROLLBACK'),false);
});
test('missing episode rolls back and releases connection',async()=>{
 const m=mock({missing:true});
 await assert.rejects(new PgDirectorDashboard(m.pool).getEpisode({episodeId:'ep1'}),/not found/);
 const sql=m.calls.map(x=>x.sql);
 assert.equal(sql.at(-2),'ROLLBACK');assert.equal(sql.at(-1),'RELEASE');
 assert.equal(sql.includes('COMMIT'),false);
});
test('query failure rolls back and releases connection',async()=>{
 const calls=[];const pool={connect:async()=>({query:async sql=>{
  calls.push(sql);if(sql.includes('FROM stage_director_shot_jobs'))throw Error('read failure');
  if(sql.includes('FROM stage_director_budgets b'))return {rows:[{episode_id:'ep1',limit_cents:1000,spending_paused:false,confirmed_by:'owner',reviewer_id:'editor'}]};
  return {rows:[]};
 },release:()=>calls.push('RELEASE')})};
 await assert.rejects(new PgDirectorDashboard(pool).getEpisode({episodeId:'ep1'}),/read failure/);
 assert.equal(calls.at(-2),'ROLLBACK');assert.equal(calls.at(-1),'RELEASE');
});
test('rollback failure does not conceal original read error and still releases',async()=>{
 const calls=[];const pool={connect:async()=>({query:async sql=>{
  calls.push(sql);
  if(sql==='ROLLBACK')throw Error('rollback failure');
  if(sql.includes('FROM stage_director_budgets b'))throw Error('original query failure');
  return {rows:[]};
 },release:()=>calls.push('RELEASE')})};
 await assert.rejects(new PgDirectorDashboard(pool).getEpisode({episodeId:'ep1'}),/original query failure/);
 assert.equal(calls.at(-1),'RELEASE');
});
