import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrivateMp4Storage} from './private-mp4-storage.mjs';
import {createStageSupabaseStorage} from './stage-supabase-storage.mjs';
import {createStageVideoDelivery} from './stage-video-delivery.mjs';

test('private Supabase upload and owner-only signed playback are wired together',async()=>{
 const uploads=new Map(),signRequests=[];
 const client={storage:{from:bucket=>{
  assert.equal(bucket,'stage-private');
  return {
   upload:async(key,body,options)=>{
    assert.equal(options.upsert,false);
    assert.equal(options.contentType,'video/mp4');
    uploads.set(key,Buffer.from(body));
    return {data:{path:key},error:null};
   },
   createSignedUrl:async(key,seconds)=>{
    signRequests.push({key,seconds});
    if(!uploads.has(key))return {data:null,error:Error('not found')};
    return {data:{signedUrl:'https://storage.example.test/object/sign/'+key+'?token=private'},error:null};
   }
  };
 }}};
 const adapter=createStageSupabaseStorage({client,bucket:'stage-private'});
 const storage=createPrivateMp4Storage({putObject:adapter.putObject,bucket:'stage-private'});
 const video=Buffer.alloc(64);video.write('ftyp',4);
 const saved=await storage.savePrivate({taskId:'task_123',verified:{bytes:video,valid:true,format:'mp4'}});
 assert.deepEqual(uploads.get(saved.storageKey),video);
 const record={jobId:'job_123',ownerId:'owner_1',state:'VERIFIED',storageKey:saved.storageKey};
 const delivery=createStageVideoDelivery({
  findAsset:async({jobId,userId})=>jobId===record.jobId&&userId===record.ownerId?record:null,
  createSignedReadUrl:adapter.createSignedReadUrl
 });
 assert.deepEqual(await delivery.getPlayback({userId:'intruder',jobId:'job_123'}),{state:'NOT_FOUND'});
 assert.equal(signRequests.length,0,'unauthorized requests must never sign storage URLs');
 const response=await delivery.getPlayback({userId:'owner_1',jobId:'job_123'});
 assert.equal(response.state,'READY');
 assert.equal(response.expiresInSeconds,120);
 assert.equal(signRequests.length,1);
 assert.deepEqual(signRequests[0],{key:saved.storageKey,seconds:120});
 assert.equal(Object.hasOwn(response,'storageKey'),false);
 assert.equal(Object.hasOwn(response,'ownerId'),false);
});
test('unverified video never requests signed playback URL',async()=>{
 let signed=0;
 const delivery=createStageVideoDelivery({
  findAsset:async()=>({jobId:'job_1',ownerId:'owner_1',state:'PROCESSING',storageKey:'stage-videos/task/'+ 'a'.repeat(64)+'.mp4'}),
  createSignedReadUrl:async()=>{signed++;return 'https://example.test/a'}
 });
 assert.deepEqual(await delivery.getPlayback({userId:'owner_1',jobId:'job_1'}),{state:'NOT_FOUND'});
 assert.equal(signed,0);
});
