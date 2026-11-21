import test from 'node:test';
import assert from 'node:assert/strict';
import {processRunwayIngest} from './runway-ingest-orchestrator.mjs';
function setup(){
 const steps=[];
 return {steps,workerId:'w1',
  queue:{claim:async()=>{steps.push('claim');return {providerTaskId:'t1'}},
   complete:async()=>steps.push('complete'),flagForReview:async()=>steps.push('review')},
  provider:{getTask:async()=>{steps.push('provider');return {id:'t1',status:'SUCCEEDED',output:['https://example.org/video.mp4']}}},
  media:{fetchAndVerify:async()=>{steps.push('verify');return {format:'mp4',valid:true}}},
  storage:{savePrivate:async()=>{steps.push('store');return {storageKey:'private/video.mp4'}}}
 };
}
test('verifies and stores before completion',async()=>{
 const s=setup();const r=await processRunwayIngest(s);
 assert.equal(r.state,'VERIFIED');
 assert.deepEqual(s.steps,['claim','provider','verify','store','complete']);
});
test('pending task is sent to review',async()=>{
 const s=setup();s.provider.getTask=async()=>({id:'t1',status:'RUNNING'});
 assert.equal((await processRunwayIngest(s)).state,'REVIEW_REQUIRED');
 assert.equal(s.steps.includes('store'),false);
});
test('failed media verification never reaches storage',async()=>{
 const s=setup();s.media.fetchAndVerify=async()=>({format:'mp4',valid:false});
 assert.equal((await processRunwayIngest(s)).state,'REVIEW_REQUIRED');
 assert.equal(s.steps.includes('store'),false);
});
test('storage failure does not mark complete',async()=>{
 const s=setup();s.storage.savePrivate=async()=>{throw Error('offline')};
 assert.equal((await processRunwayIngest(s)).state,'REVIEW_REQUIRED');
 assert.equal(s.steps.includes('complete'),false);
});
test('idle worker does nothing',async()=>{
 const s=setup();s.queue.claim=async()=>null;
 assert.deepEqual(await processRunwayIngest(s),{state:'IDLE'});
});
test('rejects missing dependencies',async()=>{
 await assert.rejects(processRunwayIngest({}),/dependencies/);
});
