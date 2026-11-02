import test from "node:test";
import assert from "node:assert/strict";
import {estimateCbrMp3Duration} from "../mp3-duration.js";
function frames(n=100){
 const frameSize=417,b=new Uint8Array(n*frameSize);
 for(let i=0;i<n;i++)b.set([0xff,0xfb,0x90,0x00],i*frameSize);
 return b.buffer;
}
test("estimates duration from complete CBR MPEG1 Layer III frames",()=>{
 const duration=estimateCbrMp3Duration(frames());
 assert.ok(duration>2.6&&duration<2.7);
});
test("rejects fake ID3-only data",()=>{
 const b=new Uint8Array(2048);b.set([73,68,51,4,0,0,0,0,0,0]);
 assert.throws(()=>estimateCbrMp3Duration(b.buffer),{code:"INVALID_FRAME"});
});
test("rejects truncated frame",()=>{
 const b=new Uint8Array(frames());assert.throws(()=>estimateCbrMp3Duration(b.slice(0,-1).buffer),{code:"TRUNCATED_FRAME"});
});
test("rejects unsupported short audio",()=>assert.throws(()=>estimateCbrMp3Duration(new Uint8Array(20).buffer),{code:"TOO_SHORT"}));
