import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageSupabaseStorage} from './stage-supabase-storage.mjs';
const key='stage-videos/task_1/'+'a'.repeat(64)+'.mp4';
function fixture(){const calls=[];const storage={upload:async(...args)=>{calls.push(['upload',...args]);return {data:{path:args[0]},error:null}},createSignedUrl:async(...args)=>{calls.push(['sign',...args]);return {data:{signedUrl:'https://example.test/video?token=1'},error:null}}};return {calls,client:{storage:{from:()=>storage}}};}
test('private upload requires expected bucket and immutable key',async()=>{
 const {calls,client}=fixture();const s=createStageSupabaseStorage({client,bucket:'stage-private'});
 await s.putObject({bucket:'stage-private',key,body:Buffer.from('abc'),contentType:'video/mp4',private:true});
 assert.equal(calls[0][2].upsert,false);
 await assert.rejects(s.putObject({bucket:'public',key,body:Buffer.from('abc'),contentType:'video/mp4',private:true}),/Invalid private/);
 await assert.rejects(s.putObject({bucket:'stage-private',key:'../escape',body:Buffer.from('abc'),contentType:'video/mp4',private:true}),/Invalid private/);
});
test('signed reads are bounded and only for stage video keys',async()=>{
 const {calls,client}=fixture();const s=createStageSupabaseStorage({client,bucket:'stage-private'});
 assert.match(await s.createSignedReadUrl({storageKey:key,ttlSeconds:120}),/^https:/);
 assert.deepEqual(calls[0],['sign',key,120]);
 await assert.rejects(s.createSignedReadUrl({storageKey:key,ttlSeconds:3600}),/Invalid private/);
});
test('storage errors fail closed',async()=>{
 const client={storage:{from:()=>({upload:async()=>({error:Error('denied')}),createSignedUrl:async()=>({error:Error('denied')})})}};
 const s=createStageSupabaseStorage({client,bucket:'stage-private'});
 await assert.rejects(s.putObject({bucket:'stage-private',key,body:Buffer.from('abc'),contentType:'video/mp4',private:true}),/upload failed/);
 await assert.rejects(s.createSignedReadUrl({storageKey:key,ttlSeconds:120}),/signing failed/);
});
