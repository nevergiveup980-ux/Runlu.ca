import test from 'node:test';
import assert from 'node:assert/strict';
import {submitRunwayAttempt} from './runway-submit-service.mjs';
function setup(createTask=async()=>({id:'provider-1'})) {
 const events=[];
 const repository={markSubmitting:async()=>events.push('journal-start'),markSubmitted:async()=>events.push('journal-saved'),markUnknown:async()=>events.push('journal-unknown')};
 const provider={createTask:async(...args)=>{events.push('provider-call');return createTask(...args)}};
 return {events,repository,provider};
}
test('journals before calling provider and saves task ID',async()=>{
 const s=setup();const result=await submitRunwayAttempt({...s,attemptId:'a',request:{prompt:'hello'}});
 assert.deepEqual(s.events,['journal-start','provider-call','journal-saved']);
 assert.equal(result.providerTaskId,'provider-1');
});
test('ambiguous provider error never triggers automatic retry',async()=>{
 const s=setup(async()=>{throw new Error('timeout')});
 const result=await submitRunwayAttempt({...s,attemptId:'a',request:{}});
 assert.equal(result.state,'RECONCILIATION_REQUIRED');
 assert.deepEqual(s.events,['journal-start','provider-call','journal-unknown']);
});
test('missing task ID requires reconciliation',async()=>{
 const s=setup(async()=>({status:'PENDING'}));
 const result=await submitRunwayAttempt({...s,attemptId:'a',request:{}});
 assert.equal(result.state,'RECONCILIATION_REQUIRED');
});
test('journal failure prevents provider call',async()=>{
 const s=setup();s.repository.markSubmitting=async()=>{throw new Error('db down')};
 await assert.rejects(submitRunwayAttempt({...s,attemptId:'a',request:{}}),/db down/);
 assert.deepEqual(s.events,[]);
});
test('save failure surfaces error without resubmission',async()=>{
 const s=setup();s.repository.markSubmitted=async()=>{throw new Error('save failed')};
 await assert.rejects(submitRunwayAttempt({...s,attemptId:'a',request:{}}),/save failed/);
 assert.deepEqual(s.events,['journal-start','provider-call']);
});
test('journal failure after timeout raises aggregate error',async()=>{
 const s=setup(async()=>{throw new Error('timeout')});
 s.repository.markUnknown=async()=>{throw new Error('db unavailable')};
 await assert.rejects(submitRunwayAttempt({...s,attemptId:'a',request:{}}),AggregateError);
});
test('rejects missing dependencies before journaling',async()=>{
 await assert.rejects(submitRunwayAttempt({attemptId:'a'}),/Dependencies required/);
});
