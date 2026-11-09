import test from "node:test";
import assert from "node:assert/strict";
import {createMusicPlaybackController} from "./playback-controller.mjs";
test("reuses a valid link without regenerating a song",async()=>{
 let now=0,calls=0;
 const p=createMusicPlaybackController({clock:()=>now,fetchAccess:async()=>({url:"https://example.test/"+(++calls),expires_in:60})});
 assert.equal(await p.getLink("job-1"),"https://example.test/1");
 now=50000;assert.equal(await p.getLink("job-1"),"https://example.test/1");
 now=56000;assert.equal(await p.getLink("job-1"),"https://example.test/2");
 assert.equal(calls,2);
});
test("concurrent refresh shares one access request",async()=>{
 let calls=0;const p=createMusicPlaybackController({fetchAccess:async()=>{calls++;await Promise.resolve();return {url:"https://example.test/signed",expires_in:60}}});
 const urls=await Promise.all(Array.from({length:100},()=>p.getLink("job-1",{force:true})));
 assert.equal(new Set(urls).size,1);assert.equal(calls,1);
});
test("rejects insecure URLs and invalid expiry",async()=>{
 for(const response of [{url:"http://example.test/x",expires_in:60},{url:"https://example.test/x",expires_in:0}]){
  const p=createMusicPlaybackController({fetchAccess:async()=>response});
  await assert.rejects(p.getLink("job-1"));
 }
});
test("clear invalidates cached link on logout",async()=>{
 let calls=0;const p=createMusicPlaybackController({fetchAccess:async()=>({url:"https://example.test/"+(++calls),expires_in:60})});
 await p.getLink("job-1");p.clear();await p.getLink("job-1");assert.equal(calls,2);
});

test("logout invalidates in-flight access response",async()=>{
 let release;
 const pending=new Promise(resolve=>{release=resolve});
 const p=createMusicPlaybackController({fetchAccess:async()=>{await pending;return {url:"https://example.test/old-user",expires_in:60}}});
 const request=p.getLink("job-1");
 p.clear();
 release();
 await assert.rejects(request,/PLAYBACK_SESSION_CHANGED/);
});
test("new account access is not overwritten by old in-flight response",async()=>{
 let releaseOld;
 const oldPending=new Promise(resolve=>{releaseOld=resolve});
 let calls=0;
 const p=createMusicPlaybackController({fetchAccess:async()=>{
   calls++;
   if(calls===1){await oldPending;return {url:"https://example.test/old",expires_in:60}}
   return {url:"https://example.test/new",expires_in:60};
 }});
 const old=p.getLink("job-1");
 p.clear();
 const newer=await p.getLink("job-2");
 releaseOld();
 await assert.rejects(old,/PLAYBACK_SESSION_CHANGED/);
 assert.equal(newer,"https://example.test/new");
 assert.equal(await p.getLink("job-2"),newer);
});

test("switching songs invalidates a slower prior link request",async()=>{
 let releaseOld;
 const pending=new Promise(resolve=>{releaseOld=resolve});
 const p=createMusicPlaybackController({fetchAccess:async jobId=>{
  if(jobId==="old"){await pending;return {url:"https://example.test/old",expires_in:60}}
  return {url:"https://example.test/new",expires_in:60};
 }});
 const old=p.getLink("old");
 const newer=await p.getLink("new");
 releaseOld();
 await assert.rejects(old,/PLAYBACK_SESSION_CHANGED/);
 assert.equal(newer,"https://example.test/new");
 assert.equal(await p.getLink("new"),newer);
});
