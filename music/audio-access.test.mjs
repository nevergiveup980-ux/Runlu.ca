import test from "node:test";
import assert from "node:assert/strict";
import {getMusicAudioAccess} from "./audio-access.mjs";
const job={id:"song-1",userId:"alice",status:"completed",audioStored:true,objectKey:"private/alice/song-1.mp3"};
function deps(record=job){
 let signed=0;
 return {store:{get:async()=>record},storage:{createDownload:async()=>{signed++;return "https://storage.example.invalid/signed"}},calls:()=>signed};
}
test("owner gets short-lived URL, no raw object key",async()=>{
 const d=deps();const result=await getMusicAudioAccess({authenticatedUserId:"alice",jobId:"song-1",...d});
 assert.equal(result.expires_in,60);assert.equal(Object.hasOwn(result,"objectKey"),false);assert.equal(d.calls(),1);
});
test("other user cannot cause signed URL creation",async()=>{
 const d=deps();await assert.rejects(getMusicAudioAccess({authenticatedUserId:"bob",jobId:"song-1",...d}),/NOT_FOUND/);
 assert.equal(d.calls(),0);
});
test("incomplete and uncertain songs cannot get URLs",async()=>{
 for(const status of ["queued","running","needs_review","failed"]){
  const d=deps({...job,status});
  await assert.rejects(getMusicAudioAccess({authenticatedUserId:"alice",jobId:"song-1",...d}),/AUDIO_NOT_READY/);
  assert.equal(d.calls(),0);
 }
});
test("missing stored object key is not downloadable",async()=>{
 const d=deps({...job,objectKey:""});
 await assert.rejects(getMusicAudioAccess({authenticatedUserId:"alice",jobId:"song-1",...d}),/AUDIO_NOT_READY/);
});
test("invalid signed URL is rejected",async()=>{
 const d=deps();d.storage.createDownload=async()=>"";
 await assert.rejects(getMusicAudioAccess({authenticatedUserId:"alice",jobId:"song-1",...d}),/AUDIO_LINK_UNAVAILABLE/);
});

test("signed download uses verified owner and trusted stored path",async()=>{
 const d=deps();let args;
 d.storage.createDownload=async x=>{args=x;return "https://storage.example.invalid/signed"};
 await getMusicAudioAccess({authenticatedUserId:"alice",jobId:"song-1",...d});
 assert.deepEqual(args,{userId:"alice",jobId:"song-1",storedPath:"private/alice/song-1.mp3",expiresIn:60});
});
