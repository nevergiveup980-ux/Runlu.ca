// Deterministic concurrency model tests; NOT a real PostgreSQL race test.
// Models per-user serialization and atomic rollback, with no network or charges.
import test from "node:test";
import assert from "node:assert/strict";
import {createMusicService} from "./job-service.mjs";

const user="12345678-1234-1234-1234-123456789abc";
const project={title:"Wind Years",lyrics:"Entirely original words",language:"en",voice:"female",style:"folk"};
const args=(key,body=project)=>({authenticatedUserId:user,idempotencyKey:key,body});
const deferred=()=>{let release;const promise=new Promise(r=>release=r);return {promise,release}};
function model({initialCredits=1,failInsert=false}={}){
 let credits=initialCredits,charges=0,serial=Promise.resolve(),sequence=0;
 const jobs=new Map(),keys=new Map();
 const store={
  reserveAndCreate(input){
   // Queue each request on a simulated account-level transaction lock.
   const task=serial.then(async()=>{
    const composite=input.userId+":"+input.key;
    if(keys.has(composite)){
     const old=jobs.get(keys.get(composite));
     if(JSON.stringify(old.project)!==JSON.stringify(input.project))throw Error("IDEMPOTENCY_PAYLOAD_MISMATCH");
     return {id:old.id,status:old.status};
    }
    if(credits<1)throw Error("INSUFFICIENT_CREDITS");
    // Work in local transaction state: failed insertion commits nothing.
    const id="job-"+(++sequence);
    if(failInsert)throw Error("INJECTED_JOB_INSERT_FAILURE");
    jobs.set(id,{id,userId:input.userId,project:input.project,status:"queued"});
    keys.set(composite,id);
    credits--;charges++;
    return {id,status:"queued"};
   });
   serial=task.then(()=>undefined,()=>undefined);
   return task;
  },
  get:async id=>jobs.get(id),
  claimQueued:async id=>{const j=jobs.get(id);if(j?.status!=="queued")return null;j.status="running";return {...j}},
  finish:async()=>{}
 };
 const provider={generate:async()=>{throw Error("PROVIDER_SHOULD_NOT_RUN")}};
 const storage={savePrivate:async()=>{throw Error("STORAGE_SHOULD_NOT_RUN")}};
 return {service:createMusicService({store,provider,storage}),snapshot:()=>({credits,charges,jobs:jobs.size})};
}
test("two distinct simultaneous requests for last credit: one wins",async()=>{
 const f=model();
 const settled=await Promise.allSettled([
  f.service.submit(args("simultaneous-key-0001")),
  f.service.submit(args("simultaneous-key-0002"))
 ]);
 assert.equal(settled.filter(x=>x.status==="fulfilled").length,1);
 assert.equal(settled.filter(x=>x.status==="rejected"&&x.reason.message==="INSUFFICIENT_CREDITS").length,1);
 assert.deepEqual(f.snapshot(),{credits:0,charges:1,jobs:1});
});
test("simultaneous identical requests return one job and one charge",async()=>{
 const f=model();
 const results=await Promise.all([f.service.submit(args("same-request-key-01")),f.service.submit(args("same-request-key-01"))]);
 assert.equal(results[0].id,results[1].id);
 assert.deepEqual(f.snapshot(),{credits:0,charges:1,jobs:1});
});
test("same key with changed lyrics fails without extra charge",async()=>{
 const f=model();
 const results=await Promise.allSettled([
  f.service.submit(args("same-request-key-02")),
  f.service.submit(args("same-request-key-02",{...project,lyrics:"different lyrics"}))
 ]);
 assert.equal(results.filter(x=>x.status==="fulfilled").length,1);
 assert.equal(results.filter(x=>x.status==="rejected").length,1);
 assert.deepEqual(f.snapshot(),{credits:0,charges:1,jobs:1});
});
test("job insertion failure leaves credits untouched",async()=>{
 const f=model({failInsert:true});
 await assert.rejects(f.service.submit(args("failed-insert-key-01")),/INJECTED_JOB_INSERT_FAILURE/);
 assert.deepEqual(f.snapshot(),{credits:1,charges:0,jobs:0});
});
