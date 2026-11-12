import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectorDryRunDispatcher} from './dry-run-dispatcher.mjs';
const ids={episodeId:'e1',shotId:'s1',attemptId:'a1'};
function harness({authorized=true,response={accepted:true,providerTaskId:'task_1'},throws=false,ackFails=false}={}){
 const calls=[];
 const preflight={authorize:async()=>{calls.push('preflight');if(!authorized)throw Error('paused');return {authorized:true}}};
 const coordinator={
  acknowledge:async()=>{calls.push('ack');if(ackFails)throw Error('db lost');return {state:'SUBMITTED'}},
  flagUnknown:async()=>{calls.push('unknown');return {state:'UNKNOWN',retryAllowed:false}}
 };
 const provider={submit:async()=>{calls.push('provider');if(throws)throw Error('timeout');return response}};
 return {calls,dispatcher:new DirectorDryRunDispatcher({preflight,coordinator,provider})};
}
test('accepted simulated provider task is acknowledged',async()=>{
 const h=harness();assert.equal((await h.dispatcher.dispatch(ids)).state,'SUBMITTED');
 assert.deepEqual(h.calls,['preflight','provider','ack']);
});
test('paused budget never reaches simulated provider',async()=>{
 const h=harness({authorized:false});
 await assert.rejects(h.dispatcher.dispatch(ids),/paused/);
 assert.deepEqual(h.calls,['preflight']);
});
test('timeout and rejection are unknown, never automatically retried',async()=>{
 for(const opts of [{throws:true},{response:{accepted:false}}]){
  const h=harness(opts);const result=await h.dispatcher.dispatch(ids);
  assert.equal(result.state,'UNKNOWN');assert.equal(result.retryAllowed,false);
  assert.deepEqual(h.calls,['preflight','provider','unknown']);
 }
});
test('lost acknowledgement stays unknown without a second provider request',async()=>{
 const h=harness({ackFails:true});const result=await h.dispatcher.dispatch(ids);
 assert.equal(result.state,'UNKNOWN');assert.equal(result.retryAllowed,false);
 assert.equal(h.calls.filter(x=>x==='provider').length,1);
});
test('simultaneous same-attempt dispatch blocked',async()=>{
 let resolve;const provider={submit:()=>new Promise(r=>{resolve=r})};
 const d=new DirectorDryRunDispatcher({
  preflight:{authorize:async()=>({authorized:true})},
  coordinator:{acknowledge:async()=>({state:'SUBMITTED'}),flagUnknown:async()=>({state:'UNKNOWN'})},
  provider
 });
 const first=d.dispatch(ids);await assert.rejects(d.dispatch(ids),/Duplicate/);
 await new Promise(r=>setImmediate(r));resolve({accepted:true,providerTaskId:'task_1'});
 assert.equal((await first).state,'SUBMITTED');
});
