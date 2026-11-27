import test from 'node:test';
import assert from 'node:assert/strict';
import {createShotJob,transitionShotJob,shotRetryReady} from './shot-job.mjs';
const step=(job,to,extra={})=>transitionShotJob(job,{to,...extra});
test('shot can complete independently with immutable transition history',()=>{
 const draft=createShotJob({shotId:'shot_001',characterRevisionIds:['lead_v1']});
 let j=step(draft,'READY');j=step(j,'RESERVED',{attemptId:'attempt_1'});
 j=step(j,'SUBMITTED');j=step(j,'SUCCEEDED',{outputAssetId:'video_1'});
 assert.equal(j.outputAssetId,'video_1');assert.equal(j.history.length,4);
 assert.equal(draft.state,'DRAFT');
 assert.throws(()=>step(j,'READY'));
});
test('failed shot requires settled attempt before retry and new attempt ID',()=>{
 let j=step(createShotJob({shotId:'shot_002'}),'READY');
 j=step(j,'RESERVED',{attemptId:'a1'});j=step(j,'SUBMITTED');
 j=step(j,'FAILED',{failureReason:'Provider timeout'});
 assert.throws(()=>shotRetryReady(j,{settledAttemptIds:[]}));
 j=shotRetryReady(j,{settledAttemptIds:['a1']});
 j=step(j,'RESERVED',{attemptId:'a2'});
 assert.equal(j.attemptId,'a2');assert.equal(j.failureReason,null);
});
test('unknown provider outcome cannot be retried blindly',()=>{
 let j=step(createShotJob({shotId:'shot_003'}),'READY');
 j=step(j,'RESERVED',{attemptId:'a1'});j=step(j,'SUBMITTED');j=step(j,'UNKNOWN');
 assert.throws(()=>shotRetryReady(j,{settledAttemptIds:['a1']}));
 assert.throws(()=>step(j,'READY'));
});
test('invalid transitions and missing verified output are rejected',()=>{
 const j=createShotJob({shotId:'shot_004'});
 assert.throws(()=>step(j,'SUBMITTED'));
 let x=step(j,'READY');x=step(x,'RESERVED',{attemptId:'a1'});x=step(x,'SUBMITTED');
 assert.throws(()=>step(x,'SUCCEEDED'));
});
