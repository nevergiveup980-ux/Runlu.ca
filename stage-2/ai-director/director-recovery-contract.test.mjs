import test from 'node:test';
import assert from 'node:assert/strict';
import {projectDirectorRecovery} from './director-recovery-contract.mjs';
const item={attemptId:'a1',shotId:'s1',state:'DISPATCHING',providerTaskId:null,retryAllowed:false,requiresManualReconciliation:true};
test('read-only mobile recovery projection exposes no actions',()=>{
 const result=projectDirectorRecovery([item]);
 assert.deepEqual(Object.keys(result[0]),['attemptId','shotId','state','providerTaskId','retryAllowed','requiresManualReconciliation','label']);
 assert.equal(result[0].retryAllowed,false);
 assert.match(result[0].label,/unconfirmed/);
});
test('unknown result is clearly flagged for manual review',()=>{
 const result=projectDirectorRecovery([{...item,state:'UNKNOWN',providerTaskId:'task_1'}]);
 assert.match(result[0].label,/unknown/);
 assert.equal(result[0].providerTaskId,'task_1');
});
test('duplicate or invalid inventory fails closed',()=>{
 assert.throws(()=>projectDirectorRecovery([item,item]),/Invalid/);
 assert.throws(()=>projectDirectorRecovery([{...item,retryAllowed:true}]),/Invalid/);
 assert.throws(()=>projectDirectorRecovery([{...item,attemptId:'bad id'}]),/Invalid/);
});
