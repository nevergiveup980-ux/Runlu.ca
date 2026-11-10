// RUNLU MUSIC offline end-to-end simulation: no network, provider calls, charges or secrets.
// Exercise submission, idempotency, worker, private storage, library, and signed download.
import assert from "node:assert/strict";
import test from "node:test";
import {createMusicService} from "./job-service.mjs";
import {createMusicLibrary} from "./music-library.mjs";
import {createPrivateMusicStorage} from "./private-storage.mjs";

const owner="12345678-1234-1234-1234-123456789abc";
const outsider="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const jobId="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const project={title:"Wind Years",lyrics:"A new original chorus",language:"en",voice:"female",style:"folk"};
function fixture(){
 const jobs=new Map(),keys=new Map(),uploads=new Map(),calls={provider:0,charged:0,uploads:0};
 let credits=1;
 const bucket={
  async upload(path,bytes,opts){if(opts.upsert||uploads.has(path))return {error:{message:"exists"}};uploads.set(path,bytes);calls.uploads++;return {error:null}},
  async createSignedUrl(path,seconds){return uploads.has(path)?{data:{signedUrl:"https://example.test/private?path="+encodeURIComponent(path)+"&ttl="+seconds},error:null}:{error:{message:"missing"}}}
 };
 const storage=createPrivateMusicStorage({supabase:{storage:{from:()=>bucket}}});
 const store={
  async reserveAndCreate({userId,key,project:p}){
   const k=userId+":"+key;
   if(keys.has(k)){const existing=jobs.get(keys.get(k));if(JSON.stringify(existing.project)!==JSON.stringify(p))throw Error("IDEMPOTENCY_PAYLOAD_MISMATCH");return {id:existing.id,status:existing.status}}
   if(credits<1)throw Error("INSUFFICIENT_CREDITS");
   credits--;calls.charged++;
   const row={id:jobId,userId,project:p,status:"queued",audioStored:false,createdAt:"2026-11-08T12:00:00Z"};
   jobs.set(jobId,row);keys.set(k,jobId);return {id:jobId,status:"queued"};
  },
  async get(id){return jobs.get(id)},
  async claimQueued(id){const row=jobs.get(id);if(!row||row.status!=="queued")return null;row.status="running";return {...row}},
  async finish({id,status,objectKey,errorCode}){Object.assign(jobs.get(id),{status,objectKey,errorCode,audioStored:!!objectKey})},
  async listOwned({userId}){return [...jobs.values()].filter(row=>row.userId===userId)},
  async getOwned({userId,id}){const row=jobs.get(id);return row?.userId===userId?row:null},
  cursorFor(){return null}
 };
 const provider={async generate(){calls.provider++;return {bytes:new Uint8Array([73,68,51,3,0,0,0,0]),contentType:"audio/mpeg"}}};
 return {service:createMusicService({store,provider,storage}),library:createMusicLibrary({store,storage}),jobs,calls,credits:()=>credits};
}
test("full simulated song lifecycle, no double charge, private access",async()=>{
 const f=fixture(),args={authenticatedUserId:owner,body:project,idempotencyKey:"unique-request-123456"};
 const first=await f.service.submit(args);
 const replay=await f.service.submit(args);
 assert.equal(first.id,replay.id);assert.equal(f.calls.charged,1);assert.equal(f.credits(),0);
 assert.deepEqual(await f.service.process({id:first.id}),{processed:true,status:"completed"});
 assert.deepEqual(await f.service.process({id:first.id}),{processed:false});
 assert.equal(f.calls.provider,1);assert.equal(f.calls.uploads,1);
 const mine=await f.library.list({authenticatedUserId:owner});
 assert.equal(mine.items.length,1);assert.equal(mine.items[0].audio_available,true);
 assert.equal(JSON.stringify(mine).includes(project.lyrics),false);
 assert.match(await f.library.download({authenticatedUserId:owner,id:first.id}),/^https:\/\/example.test\/private/);
 await assert.rejects(f.library.download({authenticatedUserId:outsider,id:first.id}),/NOT_FOUND/);
 assert.deepEqual((await f.library.list({authenticatedUserId:outsider})).items,[]);
});
test("changed lyrics with same idempotency key never charges twice",async()=>{
 const f=fixture(),args={authenticatedUserId:owner,body:project,idempotencyKey:"unique-request-123456"};
 await f.service.submit(args);
 await assert.rejects(f.service.submit({...args,body:{...project,lyrics:"different lyrics"}}),/IDEMPOTENCY_PAYLOAD_MISMATCH/);
 assert.equal(f.calls.charged,1);assert.equal(f.calls.provider,0);
});
