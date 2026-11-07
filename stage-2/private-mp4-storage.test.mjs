import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateMp4Storage} from './private-mp4-storage.mjs';
const bytes=Buffer.alloc(32);bytes.write('ftyp',4);
test('stores verified bytes privately under stable content hash',async()=>{
 const calls=[];const storage=createPrivateMp4Storage({bucket:'stage-private',putObject:async x=>calls.push(x)});
 const input={taskId:'task_123',verified:{valid:true,format:'mp4',bytes}};
 const a=await storage.savePrivate(input),b=await storage.savePrivate(input);
 assert.equal(a.storageKey,b.storageKey);assert.equal(calls[0].private,true);
 assert.equal(calls[0].contentType,'video/mp4');assert.equal(calls[0].bucket,'stage-private');
 assert.equal(calls[0].key,a.storageKey);
});
test('rejects unverified bytes before upload',async()=>{
 let called=false;const storage=createPrivateMp4Storage({bucket:'private',putObject:async()=>{called=true}});
 await assert.rejects(storage.savePrivate({taskId:'t1',verified:{valid:false,format:'mp4',bytes}}),/Verified/);
 assert.equal(called,false);
});
test('rejects unsafe task IDs',async()=>{
 const storage=createPrivateMp4Storage({bucket:'private',putObject:async()=>{}});
 await assert.rejects(storage.savePrivate({taskId:'../../escape',verified:{valid:true,format:'mp4',bytes}}),/task ID/);
});
test('upload failure does not report success',async()=>{
 const storage=createPrivateMp4Storage({bucket:'private',putObject:async()=>{throw Error('upload failed')}});
 await assert.rejects(storage.savePrivate({taskId:'t1',verified:{valid:true,format:'mp4',bytes}}),/upload failed/);
});
