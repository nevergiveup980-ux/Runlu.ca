import test from "node:test";
import assert from "node:assert/strict";
import {downloadOwnedTrack,sanitizeFilename} from "../track-download.js";
const bytes=new Uint8Array([0x49,0x44,0x33,0x04,0x00,0x00]);
const makeDb=(track)=>({prepare(sql){assert.match(sql,/id=\? AND owner_id=\?/);return {bind(id,owner){assert.equal(owner,"user_1");return {async first(){return track;}}}};}});
const makeBucket=(data=bytes)=>({async get(){return {size:data.length,async arrayBuffer(){return data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)}}}});
const track={id:"track_1",title:"故乡／岁月",format:"mp3",storage_key:"private/track_1.mp3",byte_length:6};
test("returns private downloadable MP3 for owning user",async()=>{
 const r=await downloadOwnedTrack({db:makeDb(track),bucket:makeBucket(),ownerId:"user_1",trackId:"track_1"});
 assert.equal(r.status,200);assert.equal(r.headers.get("content-type"),"audio/mpeg");
 assert.match(r.headers.get("content-disposition"),/filename\*=UTF-8''/);
 assert.equal((await r.arrayBuffer()).byteLength,6);
});
test("non-owned track yields 404",async()=>{
 const r=await downloadOwnedTrack({db:makeDb(null),bucket:makeBucket(),ownerId:"user_1",trackId:"track_1"});
 assert.equal(r.status,404);
});
test("invalid MP3 signature is rejected",async()=>{
 const r=await downloadOwnedTrack({db:makeDb(track),bucket:makeBucket(new Uint8Array([0,1,2,3,4,5])),ownerId:"user_1",trackId:"track_1"});
 assert.equal(r.status,422);
});
test("storage size mismatch is rejected",async()=>{
 const r=await downloadOwnedTrack({db:makeDb({...track,byte_length:9}),bucket:makeBucket(),ownerId:"user_1",trackId:"track_1"});
 assert.equal(r.status,500);
});
test("filename removes unsafe characters",()=>assert.equal(sanitizeFilename('a/b\\c:"d"'),'abcd.mp3'));
test("unconfigured storage fails closed",async()=>{
 const r=await downloadOwnedTrack({db:null,bucket:null,ownerId:"user_1",trackId:"track_1"});
 assert.equal(r.status,503);
});
