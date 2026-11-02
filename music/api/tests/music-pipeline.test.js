import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {runMusicPipeline} from "../music-pipeline.js";
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const env={MUSIC_GENERATION_ENABLED:"true",MUSIC_TEST_APPROVED:"true",GEMINI_API_KEY:"fake"};
const request={prompt:"故乡、父母、岁月",language:"zh",instrumental:false,duration_seconds:30};
const mp3=()=>{const b=new Uint8Array(256);b.set([0x49,0x44,0x33,0x04]);return Buffer.from(b).toString("base64");};
const provider=async()=>({ok:true,json:async()=>({steps:[{type:"model_output",content:[{type:"audio",data:mp3(),mime_type:"audio/mpeg"}]}]})});
function storage({fail=false}={}){
 const calls=[];
 return {calls,bucket:{async put(k){calls.push("put:"+k);},async delete(k){calls.push("delete:"+k);}},
 db:{prepare(){return {bind(){return {async run(){calls.push("db");if(fail)throw Error("db failure");}}}}}}};
}
const args={env,request,ownerId:"user_1",trackId:"track_1",title:"故乡",durationSeconds:30,now:100,fetchImpl:provider};
test("approved generation is saved before reporting success",async()=>{
 const s=storage();const result=await runMusicPipeline({...args,...s});
 assert.equal(result.status,"stored");assert.equal(result.sha256Hex.length,64);
 assert.deepEqual(s.calls,["put:music/user_1/track_1.mp3","db"]);
});
test("storage failure never reports success and cleans R2",async()=>{
 const s=storage({fail:true});await assert.rejects(()=>runMusicPipeline({...args,...s}),{code:"DB_WRITE_FAILED"});
 assert.equal(s.calls.at(-1),"delete:music/user_1/track_1.mp3");
});
test("disabled generation never invokes provider or storage",async()=>{
 const s=storage();let invoked=false;
 await assert.rejects(()=>runMusicPipeline({...args,...s,env:{},fetchImpl:async()=>{invoked=true;}}),{code:"GENERATION_DISABLED"});
 assert.equal(invoked,false);assert.deepEqual(s.calls,[]);
});
test("missing measured duration prevents provider call",async()=>{
 const s=storage();let invoked=false;
 await assert.rejects(()=>runMusicPipeline({...args,...s,durationSeconds:0,fetchImpl:async()=>{invoked=true;}}),{code:"DURATION_NOT_VERIFIED"});
 assert.equal(invoked,false);
});
