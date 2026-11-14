import assert from "node:assert/strict";
import test from "node:test";
import {createMusicLibrary} from "./music-library.mjs";
const owner="12345678-1234-1234-1234-123456789abc",other="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",id="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
function fixture(){
 const row={id,userId:owner,status:"completed",objectKey:owner+"/"+id+".mp3",createdAt:"2026-11-08T12:00:00Z",project:{title:"Wind Years",language:"en",voice:"female",lyrics:"private lyrics",notes:"private prompt"}};
 const calls=[];
 const store={
   async listOwned({userId}){calls.push(["list",userId]);return userId===owner?[row]:[]},
   async getOwned({userId,id:jobId}){calls.push(["get",userId,jobId]);return userId===owner&&jobId===id?row:null},
   cursorFor(){return "cursor"}
 };
 const storage={async createDownload(args){calls.push(["sign",args]);return "https://example.test/signed"}};
 return {lib:createMusicLibrary({store,storage}),calls,row};
}
test("list returns safe metadata only",async()=>{
 const {lib}=fixture();const result=await lib.list({authenticatedUserId:owner});
 assert.equal(result.items.length,1);assert.equal(result.items[0].title,"Wind Years");
 assert.equal(result.items[0].audio_available,true);
 assert.equal(JSON.stringify(result).includes("private lyrics"),false);
 assert.equal(JSON.stringify(result).includes("objectKey"),false);
});
test("cross-user reads cannot access songs",async()=>{
 const {lib}=fixture();
 assert.deepEqual((await lib.list({authenticatedUserId:other})).items,[]);
 await assert.rejects(lib.download({authenticatedUserId:other,id}),/NOT_FOUND/);
});
test("signed download only after owner-scoped lookup",async()=>{
 const {lib,calls}=fixture();
 assert.match(await lib.download({authenticatedUserId:owner,id}),/^https:/);
 assert.equal(calls[0][0],"get");assert.equal(calls[1][1].expiresIn,120);
});
test("rejects invalid pagination and identifiers",async()=>{
 const {lib}=fixture();
 await assert.rejects(lib.list({authenticatedUserId:owner,limit:500}),/INVALID_LIMIT/);
 await assert.rejects(lib.download({authenticatedUserId:owner,id:"../escape"}),/INVALID_JOB_ID/);
});
test("V2 metadata and song title are used without exposing storage keys",async()=>{
 const {lib,row,calls}=fixture();row.project.version='V2';row.duration=182.4;
 const result=await lib.list({authenticatedUserId:owner});
 assert.equal(result.items[0].version,'V2');assert.equal(result.items[0].duration,182.4);
 assert.equal(result.items[0].download_status,'available');
 await lib.download({authenticatedUserId:owner,id});
 assert.equal(calls.at(-1)[1].title,'Wind Years');assert.equal(calls.at(-1)[1].version,'V2');
});
