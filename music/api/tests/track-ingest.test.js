import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {ingestMp3} from "../track-ingest.js";
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const audio=()=>{const b=new Uint8Array(256);b.set([0x49,0x44,0x33,0x04]);return b.buffer;};
const args={ownerId:"user_1",trackId:"track_1",title:"故乡",now:100,durationSeconds:30};
const fixture=({failDb=false}={})=>{const calls=[];return {calls,bucket:{async put(...a){calls.push(["put",...a]);},async delete(k){calls.push(["delete",k]);}},db:{prepare(sql){calls.push(["sql",sql]);return {bind(...values){calls.push(["bind",...values]);return {async run(){if(failDb)throw Error("db down");return {success:true};}};}}}}};};
test("stores MP3 in private owner-scoped R2 key and D1 metadata",async()=>{
 const f=fixture();const result=await ingestMp3({...f,...args,audio:audio()});
 assert.equal(result.storageKey,"music/user_1/track_1.mp3");assert.equal(result.sha256Hex.length,64);
 assert.equal(f.calls[0][0],"put");assert.match(f.calls[1][1],/INSERT INTO music_tracks/);
});
test("rejects invalid audio without writing storage",async()=>{
 const f=fixture();await assert.rejects(()=>ingestMp3({...f,...args,audio:new Uint8Array(256).buffer}),{code:"NOT_MP3"});assert.equal(f.calls.length,0);
});
test("deletes uploaded R2 object when D1 insert fails",async()=>{
 const f=fixture({failDb:true});await assert.rejects(()=>ingestMp3({...f,...args,audio:audio()}),{code:"DB_WRITE_FAILED"});
 assert.equal(f.calls.at(-1)[0],"delete");
});
test("fails closed without storage",async()=>{
 await assert.rejects(()=>ingestMp3({...args,audio:audio()}),{code:"STORAGE_NOT_CONFIGURED"});
});
