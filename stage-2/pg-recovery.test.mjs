import test from "node:test";
import assert from "node:assert/strict";
import {PgRecovery} from "./pg-recovery.mjs";
function pool({expired=[],failEvent=false,unresolved=[]}={}){
 const calls=[];
 return {calls,connect:async()=>({query:async(sql,args)=>{
  calls.push({sql,args});
  if(failEvent&&sql.includes("INSERT INTO stage_job_events"))throw Error("event failure");
  if(sql.includes("WITH expired"))return {rows:expired.map(id=>({id}))};
  if(sql.includes("FROM stage_attempts"))return {rows:unresolved};
  return {rows:[]};
 },release:()=>calls.push({sql:"RELEASE"})})};
}
test("expired leases are quarantined not requeued",async()=>{
 const p=pool({expired:["j1","j2"]});
 assert.deepEqual(await new PgRecovery(p).quarantineExpired(),["j1","j2"]);
 assert.ok(p.calls.some(x=>x.sql.includes("RECONCILIATION_REQUIRED")));
 assert.ok(!p.calls.some(x=>x.sql.includes("SET status='QUEUED'")));
});
test("recovery inserts audit event per job",async()=>{
 const p=pool({expired:["j1","j2"]});await new PgRecovery(p).quarantineExpired();
 assert.equal(p.calls.filter(x=>x.sql.includes("INSERT INTO stage_job_events")).length,2);
});
test("audit failure rolls back recovery",async()=>{
 const p=pool({expired:["j1"],failEvent:true});
 await assert.rejects(new PgRecovery(p).quarantineExpired());
 assert.ok(p.calls.some(x=>x.sql==="ROLLBACK"));
});
test("reject oversized batches",async()=>{
 const p=pool();await assert.rejects(new PgRecovery(p).quarantineExpired({limit:999}));
 assert.equal(p.calls.length,0);
});
test("unresolved attempts can be queried for reconciliation",async()=>{
 const p=pool({unresolved:[{id:"a1",provider_task_id:null,status:"RESERVED"}]});
 const a=await new PgRecovery(p).listUnresolvedAttempts("j1");
 assert.equal(a[0].id,"a1");
});

test("second recovery pass returns no additional jobs",async()=>{
 const p=pool({expired:[]});
 assert.deepEqual(await new PgRecovery(p).quarantineExpired(),[]);
 assert.equal(p.calls.filter(x=>x.sql.includes("INSERT INTO stage_job_events")).length,0);
});
