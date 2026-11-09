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
