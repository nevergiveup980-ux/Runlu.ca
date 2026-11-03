import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageVideoDelivery} from './stage-video-delivery.mjs';
const asset={jobId:'job1',ownerId:'user1',state:'VERIFIED',storageKey:'stage-videos/task/hash.mp4'};
test('owner receives short-lived HTTPS playback URL without storage key',async()=>{
 let signedArgs;
 const svc=createStageVideoDelivery({findAsset:async()=>asset,createSignedReadUrl:async args=>{signedArgs=args;return 'https://cdn.example.test/private.mp4?token=abc';}});
 const result=await svc.getPlayback({userId:'user1',jobId:'job1'});
 assert.equal(result.state,'READY');assert.equal(result.expiresInSeconds,120);
 assert.equal(signedArgs.storageKey,asset.storageKey);
 assert.equal(JSON.stringify(result).includes(asset.storageKey),false);
});
test('other user cannot get signed URL',async()=>{
 let calls=0;
 const svc=createStageVideoDelivery({findAsset:async()=>asset,createSignedReadUrl:async()=>{calls++;return 'https://cdn.example.test/a';}});
 assert.deepEqual(await svc.getPlayback({userId:'user2',jobId:'job1'}),{state:'NOT_FOUND'});
 assert.equal(calls,0);
});
test('unverified asset cannot be played',async()=>{
 const svc=createStageVideoDelivery({findAsset:async()=>({...asset,state:'INGESTING'}),createSignedReadUrl:async()=>{throw Error('must not sign')}});
 assert.deepEqual(await svc.getPlayback({userId:'user1',jobId:'job1'}),{state:'NOT_FOUND'});
});
test('rejects unsafe signed URLs',async()=>{
 const svc=createStageVideoDelivery({findAsset:async()=>asset,createSignedReadUrl:async()=> 'http://localhost/video'});
 await assert.rejects(svc.getPlayback({userId:'user1',jobId:'job1'}),/Invalid signed/);
});
test('requires authenticated identity',async()=>{
 const svc=createStageVideoDelivery({findAsset:async()=>asset,createSignedReadUrl:async()=>''});
 await assert.rejects(svc.getPlayback({userId:'',jobId:'job1'}),/Authenticated/);
});
