import test from 'node:test';
import assert from 'node:assert/strict';
import {pollRunwayTask} from './runway-poll-service.mjs';
function setup(raw) {
 const events=[];
 return {events,
  provider:{getTask:async id=>{events.push('poll');return raw;}},
  repository:{recordTaskState:async (...args)=>events.push(['record',...args])},
  ingestQueue:{enqueue:async payload=>events.push(['ingest',payload])}};
}
test('pending task persisted without ingest',async()=>{
 const s=setup({id:'t1',status:'RUNNING'});
 const r=await pollRunwayTask({...s,providerTaskId:'t1'});
 assert.equal(r.state,'WAITING');assert.deepEqual(s.events,['poll',['record','t1','WAITING',[]]]);
});
test('successful task enqueues private output after state record',async()=>{
 const url='https://example.com/private.mp4';
 const s=setup({id:'t1',status:'SUCCEEDED',output:[url]});
 const r=await pollRunwayTask({...s,providerTaskId:'t1'});
 assert.equal(r.requiresIngest,true);assert.equal(JSON.stringify(r).includes(url),false);
 assert.deepEqual(s.events.map(x=>Array.isArray(x)?x[0]:x),['poll','record','ingest']);
 assert.deepEqual(s.events[2][1],{idempotencyKey:'t1',providerTaskId:'t1',privateOutputUrls:[url]});
});
test('mismatched task IDs cannot be recorded',async()=>{
 const s=setup({id:'other',status:'RUNNING'});
 await assert.rejects(pollRunwayTask({...s,providerTaskId:'t1'}),/mismatch/);
 assert.equal(s.events.length,1);
});
test('invalid output URLs fail closed',async()=>{
 const s=setup({id:'t1',status:'SUCCEEDED',output:['http://bad.example']});
 await assert.rejects(pollRunwayTask({...s,providerTaskId:'t1'}),/Invalid output/);
});
test('database failure prevents ingest',async()=>{
 const s=setup({id:'t1',status:'SUCCEEDED',output:['https://example.com/a.mp4']});
 s.repository.recordTaskState=async()=>{throw Error('db offline')};
 await assert.rejects(pollRunwayTask({...s,providerTaskId:'t1'}),/db offline/);
 assert.deepEqual(s.events,['poll']);
});
test('ingest failure is surfaced rather than reporting success',async()=>{
 const s=setup({id:'t1',status:'SUCCEEDED',output:['https://example.com/a.mp4']});
 s.ingestQueue.enqueue=async()=>{throw Error('queue offline')};
 await assert.rejects(pollRunwayTask({...s,providerTaskId:'t1'}),/queue offline/);
});
test('missing ingest queue fails before provider call',async()=>{
 const s=setup({id:'t1',status:'RUNNING'});
 await assert.rejects(pollRunwayTask({providerTaskId:'t1',provider:s.provider,repository:s.repository}),/ingest queue required/);
 assert.deepEqual(s.events,[]);
});
test('invalid dependencies are rejected',async()=>{
 await assert.rejects(pollRunwayTask({providerTaskId:'t1'}),/Dependencies/);
});
