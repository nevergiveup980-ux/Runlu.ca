import test from "node:test";
import assert from "node:assert/strict";
import {PgJobOperations} from "./pg-job-operations.mjs";
function pool({claimRows=[],attemptRows=[],jobRows=[{id:"job"}],failOn}={}){
 const calls=[];
 return {calls,connect:async()=>({query:async(sql,args)=>{
  calls.push({sql,args});
  if(failOn&&sql.includes(failOn))throw Error("Injected failure");
  if(sql.includes("WITH picked"))return {rows:claimRows};
  if(sql.includes("SELECT reserved_cents"))return {rows:attemptRows};
  if(sql.includes("UPDATE stage_jobs SET reserved_cents"))return {rows:jobRows};
  return {rows:[]};
 },release:()=>calls.push({sql:"RELEASE"})})};
}
test("claim returns null when queue empty",async()=>{
 const p=pool();const result=await new PgJobOperations(p).claim("worker");
 assert.equal(result,null);assert.ok(p.calls.some(x=>x.sql==="COMMIT"));
});
test("claim uses skip locked and returns task",async()=>{
 const p=pool({claimRows:[{id:"j1"}]});const result=await new PgJobOperations(p).claim("worker");
 assert.equal(result.id,"j1");assert.ok(p.calls.some(x=>x.sql.includes("SKIP LOCKED")));
});
test("settlement updates job and attempt atomically",async()=>{
 const p=pool({attemptRows:[{status:"RESERVED",reserved_cents:"500"}]});
 const result=await new PgJobOperations(p).settle("job","attempt",300);
 assert.deepEqual(result,{chargedCents:300,releasedCents:200});
 assert.ok(p.calls.some(x=>x.sql==="COMMIT"));
});
test("overbilling rolls back",async()=>{
 const p=pool({attemptRows:[{status:"RESERVED",reserved_cents:"500"}]});
 await assert.rejects(new PgJobOperations(p).settle("job","attempt",501));
 assert.ok(p.calls.some(x=>x.sql==="ROLLBACK"));
});
test("failed event insert rolls back",async()=>{
 const p=pool({attemptRows:[{status:"RESERVED",reserved_cents:"500"}],failOn:"INSERT INTO stage_job_events"});
 await assert.rejects(new PgJobOperations(p).settle("job","attempt",300));
 assert.ok(p.calls.some(x=>x.sql==="ROLLBACK"));
});

test("submitted provider attempt may be settled after billing is known",async()=>{
 const p=pool({attemptRows:[{status:"SUBMITTED",reserved_cents:"500"}]});
 const result=await new PgJobOperations(p).settle("job","attempt",300);
 assert.deepEqual(result,{chargedCents:300,releasedCents:200});
 assert.ok(p.calls.some(x=>x.sql==="COMMIT"));
});
test("submitting or reconciliation-required attempts cannot settle blindly",async()=>{
 for(const status of ["SUBMITTING","RECONCILIATION_REQUIRED","SETTLED"]){
  const p=pool({attemptRows:[{status,reserved_cents:"500"}]});
  await assert.rejects(new PgJobOperations(p).settle("job","attempt",300),/not settleable/);
  assert.ok(p.calls.some(x=>x.sql==="ROLLBACK"));
 }
});
