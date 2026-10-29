import test from "node:test";
import assert from "node:assert/strict";
import worker from "../worker.js";

const call=(path,options={})=>worker.fetch(new Request("https://music.example.test"+path,options),{});
const valid={prompt:"故乡、父母、岁月",language:"zh",duration_seconds:30,instrumental:false,idempotency_key:"test_12345678"};
const post=(payload)=>call("/api/music/jobs",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});

test("health never claims generation is ready",async()=>{
 const res=await call("/api/music/health");
 assert.equal(res.status,200);
 const data=await res.json();
 assert.equal(data.generation_available,false);
});
test("valid creation request is rejected safely until provider is configured",async()=>{
 const res=await post(valid);
 assert.equal(res.status,503);
 const data=await res.json();
 assert.equal(data.error.code,"GENERATION_NOT_CONFIGURED");
 assert.equal(data.job_id,undefined);
});
test("invalid inputs are rejected",async()=>{
 for(const changes of [{prompt:""},{prompt:"x".repeat(1001)},{language:"xx"},{duration_seconds:3600},{instrumental:"no"},{idempotency_key:"x"}]){
  const res=await post({...valid,...changes});
  assert.equal(res.status,422,JSON.stringify(changes));
 }
});
test("invalid JSON rejected",async()=>{
 const res=await call("/api/music/jobs",{method:"POST",headers:{"content-type":"application/json"},body:"{"});
 assert.equal(res.status,400);
});
test("unimplemented routes do not leak fake assets",async()=>{
 const res=await call("/api/music/tracks/abc/download");
 assert.equal(res.status,501);
});
test("unknown routes return 404",async()=>{
 const res=await call("/nothing");
 assert.equal(res.status,404);
});
