import assert from "node:assert/strict";
import test from "node:test";
import {createMusicService} from "./job-service.mjs";
const project={title:"Wind Years",lyrics:"Original lyrics",voice:"female",style:"nostalgic",language:"en"};
function fixtures(){
 const jobs=new Map(),keys=new Map();let balance=2,calls=0,seq=0;
 const store={
  async reserveAndCreate({userId,key,project}){
   const unique=userId+":"+key;if(keys.has(unique))return {id:keys.get(unique),status:jobs.get(keys.get(unique)).status};
   if(balance<1)throw Error("INSUFFICIENT_CREDITS");
   balance--;const id="job"+(++seq);jobs.set(id,{id,userId,project,status:"queued",audioStored:false});keys.set(unique,id);return {id,status:"queued"};
  },
  async get(id){return jobs.get(id)},
  async claimQueued(id){const j=jobs.get(id);if(!j||j.status!=="queued")return null;j.status="running";return {...j}},
  async finish({id,status,objectKey,errorCode}){Object.assign(jobs.get(id),{status,objectKey,errorCode,audioStored:!!objectKey})}
 };
 const provider={async generate(){calls++;return {bytes:new Uint8Array([73,68,51,0]),contentType:"audio/mpeg"}}};
 const storage={async savePrivate({jobId}){return "private/"+jobId+".mp3"}};
 return {store,provider,storage,jobs,getBalance:()=>balance,getCalls:()=>calls};
}
test("one credit per idempotency key and no duplicate job",async()=>{
 const f=fixtures(),s=createMusicService(f),args={authenticatedUserId:"u1",body:project,idempotencyKey:"abcdefghijklmnop"};
 const a=await s.submit(args),b=await s.submit(args);assert.equal(a.id,b.id);assert.equal(f.getBalance(),1);
 await s.process({id:a.id});await s.process({id:a.id});assert.equal(f.getCalls(),1);
 assert.equal((await s.read({authenticatedUserId:"u1",id:a.id})).audio_available,true);
 await assert.rejects(s.read({authenticatedUserId:"u2",id:a.id}),/NOT_FOUND/);
});
test("no unauthenticated creation",async()=>{const s=createMusicService(fixtures());await assert.rejects(s.submit({body:project,idempotencyKey:"abcdefghijklmnop"}),/UNAUTHENTICATED/)});
test("ambiguous provider failure requires review and never retries",async()=>{
 const f=fixtures();f.provider.generate=async()=>{throw Error("timeout")};const s=createMusicService(f);
 const a=await s.submit({authenticatedUserId:"u1",body:project,idempotencyKey:"abcdefghijklmnop"});
 assert.equal((await s.process({id:a.id})).status,"needs_review");assert.deepEqual(await s.process({id:a.id}),{processed:false});
 assert.equal(f.jobs.get(a.id).status,"needs_review");
});
