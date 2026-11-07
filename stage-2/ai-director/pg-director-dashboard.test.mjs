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
