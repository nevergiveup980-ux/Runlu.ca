// Stress the ACTUAL RUNLU MUSIC orchestration module, not a standalone model.
// In-memory transactional store is a test double; this does not certify PostgreSQL.
import test from "node:test";
import assert from "node:assert/strict";
import {createMusicService} from "./job-service.mjs";

const project={title:"Wind Years",lyrics:"Entirely original song lyrics",voice:"female",style:"nostalgic",language:"en"};
const owner="stress-user";
const submit=(service,key,body=project)=>service.submit({authenticatedUserId:owner,body,idempotencyKey:key});
function fixture({credits=1,providerFailure=false,storageFailure=false}={}){
 const jobs=new Map(),keys=new Map();let serial=Promise.resolve(),calls=0,charges=0,uploads=0,seq=0;
 const store={
  reserveAndCreate({userId,key,project:p}){
   const task=serial.then(()=>{
    const unique=userId+":"+key;
    if(keys.has(unique)){
      const old=jobs.get(keys.get(unique));
      if(JSON.stringify(old.project)!==JSON.stringify(p))throw Error("IDEMPOTENCY_PAYLOAD_MISMATCH");
      return {id:old.id,status:old.status};
    }
    if(credits<1)throw Error("INSUFFICIENT_CREDITS");
    const id="stress-job-"+(++seq);
    jobs.set(id,{id,userId,project:p,status:"queued",audioStored:false});
    keys.set(unique,id);credits--;charges++;
    return {id,status:"queued"};
   });
   serial=task.then(()=>undefined,()=>undefined);
   return task;
  },
  async get(id){return jobs.get(id)},
  async claimQueued(id){
   const j=jobs.get(id);
   if(!j||j.status!=="queued")return null;
   j.status="running";return {...j};
  },
  async finish({id,status,objectKey,errorCode}){
   Object.assign(jobs.get(id),{status,objectKey,errorCode,audioStored:!!objectKey});
  }
 };
 const provider={async generate(){calls++;if(providerFailure)throw Error("TIMEOUT");return {bytes:new Uint8Array([73,68,51,3]),contentType:"audio/mpeg"}}};
 const storage={async savePrivate({jobId}){uploads++;if(storageFailure)throw Error("UPLOAD_FAILED");return "private/"+jobId+".mp3"}};
 return {service:createMusicService({store,provider,storage}),jobs,metrics:()=>({credits,charges,calls,uploads,jobs:jobs.size})};
}
test("1,000 same-key concurrent submissions consume exactly one credit",async()=>{
 const f=fixture();
 const results=await Promise.all(Array.from({length:1000},()=>submit(f.service,"stress-same-key-0001")));
 assert.equal(new Set(results.map(x=>x.id)).size,1);
 assert.deepEqual(f.metrics(),{credits:0,charges:1,calls:0,uploads:0,jobs:1});
});
test("1,000 unique concurrent submissions for 1 credit accept exactly one",async()=>{
 const f=fixture();
 const results=await Promise.allSettled(Array.from({length:1000},(_,i)=>submit(f.service,"stress-unique-"+String(i).padStart(8,"0"))));
 assert.equal(results.filter(x=>x.status==="fulfilled").length,1);
 assert.equal(results.filter(x=>x.status==="rejected"&&x.reason.message==="INSUFFICIENT_CREDITS").length,999);
 assert.deepEqual(f.metrics(),{credits:0,charges:1,calls:0,uploads:0,jobs:1});
});
test("1,000 concurrent workers call provider only once",async()=>{
 const f=fixture();const job=await submit(f.service,"stress-worker-key-0001");
 const results=await Promise.all(Array.from({length:1000},()=>f.service.process({id:job.id})));
 assert.equal(results.filter(x=>x.processed).length,1);
 assert.deepEqual(f.metrics(),{credits:0,charges:1,calls:1,uploads:1,jobs:1});
 assert.equal((await f.service.read({authenticatedUserId:owner,id:job.id})).audio_available,true);
 await assert.rejects(f.service.read({authenticatedUserId:"outsider",id:job.id}),/NOT_FOUND/);
});
test("ambiguous provider timeout never triggers a second paid call",async()=>{
 const f=fixture({providerFailure:true});const job=await submit(f.service,"stress-timeout-key-0001");
 await Promise.all(Array.from({length:1000},()=>f.service.process({id:job.id})));
 assert.equal(f.jobs.get(job.id).status,"needs_review");
 assert.equal(f.metrics().calls,1);
});
test("private storage failure requires review, never auto-generates again",async()=>{
 const f=fixture({storageFailure:true});const job=await submit(f.service,"stress-storage-key-0001");
 await Promise.all(Array.from({length:1000},()=>f.service.process({id:job.id})));
 assert.equal(f.jobs.get(job.id).status,"needs_review");
 assert.equal(f.metrics().calls,1);
 assert.equal(f.metrics().uploads,1);
});
