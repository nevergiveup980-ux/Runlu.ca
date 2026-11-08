import assert from "node:assert/strict";
import test from "node:test";
import {createPrivateMusicStorage,musicObjectKey,MUSIC_BUCKET} from "./private-storage.mjs";
const u="12345678-1234-1234-1234-123456789abc",j="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
function setup(){const calls=[];const supabase={storage:{from(bucket){assert.equal(bucket,MUSIC_BUCKET);return {
 upload:async(...args)=>{calls.push(["upload",...args]);return {error:null}},
 createSignedUrl:async(...args)=>{calls.push(["sign",...args]);return {data:{signedUrl:"https://example.test/private?token=x"},error:null}}
}}}};return {calls,service:createPrivateMusicStorage({supabase})}}
test("private audio is stored by owner/job without upsert",async()=>{
 const {calls,service}=setup();
 const path=await service.savePrivate({userId:u,jobId:j,bytes:new Uint8Array([73,68,51,4,5]),contentType:"audio/mpeg"});
 assert.equal(path,u+"/"+j+".mp3");assert.equal(calls[0][2].upsert,false);
});
test("only exact owner/job path gets a short-lived signed link",async()=>{
 const {calls,service}=setup();const path=musicObjectKey(u,j);
 assert.match(await service.createDownload({userId:u,jobId:j,storedPath:path}),/^https:/);
 assert.equal(calls[0][2],120);
 await assert.rejects(service.createDownload({userId:u,jobId:j,storedPath:"other/"+j+".mp3"}),/STORAGE_OWNERSHIP_MISMATCH/);
 await assert.rejects(service.createDownload({userId:u,jobId:j,storedPath:path,expiresIn:86400}),/INVALID_EXPIRY/);
});
test("rejects fake audio and path traversal",async()=>{
 const {service}=setup();
 await assert.rejects(service.savePrivate({userId:u,jobId:j,bytes:new Uint8Array([1,2,3,4]),contentType:"audio/mpeg"}),/INVALID_MP3_HEADER/);
 assert.throws(()=>musicObjectKey("../bad",j),/INVALID_STORAGE_ID/);
});
