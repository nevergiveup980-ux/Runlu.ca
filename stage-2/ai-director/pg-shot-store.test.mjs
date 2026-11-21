import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorShotStore} from './pg-shot-store.mjs';
function fake(rows){const calls=[];return {calls,query:async(sql,args)=>{calls.push({sql,args});return {rows}}};}
test('atomic READY claim uses conditional UPDATE and attempt identity',async()=>{
 const p=fake([{episode_id:'e1',shot_id:'s1',state:'RESERVED',attempt_id:'a1'}]);
 const result=await new PgDirectorShotStore(p).claim({episodeId:'e1',shotId:'s1',attemptId:'a1'});
 assert.equal(result.attempt_id,'a1');assert.match(p.calls[0].sql,/state='READY'/);
 assert.match(p.calls[0].sql,/UPDATE stage_director_shot_jobs/);
});
test('competing claim or stale transition fails closed',async()=>{
 const p=fake([]),store=new PgDirectorShotStore(p);
 await assert.rejects(store.claim({episodeId:'e1',shotId:'s1',attemptId:'a2'}),/already claimed/);
 await assert.rejects(store.markSubmitted({episodeId:'e1',shotId:'s1',attemptId:'a1'}),/Stale/);
});
test('successful completion requires asset ID and matching submitted state',async()=>{
 const p=fake([{state:'SUCCEEDED',output_asset_id:'asset1'}]),store=new PgDirectorShotStore(p);
 await assert.rejects(store.markSucceeded({episodeId:'e1',shotId:'s1',attemptId:'a1',outputAssetId:''}));
 const result=await store.markSucceeded({episodeId:'e1',shotId:'s1',attemptId:'a1',outputAssetId:'asset1'});
 assert.equal(result.output_asset_id,'asset1');
 assert.equal(p.calls[0].args[5],'SUBMITTED');
});
test('SQL inputs are parameterized',async()=>{
 const p=fake([]),store=new PgDirectorShotStore(p);
 await assert.rejects(store.claim({episodeId:"e1';DROP TABLE x",shotId:'s1',attemptId:'a1'}));
 assert.equal(p.calls.length,0);
});
