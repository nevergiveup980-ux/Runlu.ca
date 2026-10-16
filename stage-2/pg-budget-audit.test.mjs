import test from "node:test";
import assert from "node:assert/strict";
import {PgBudgetRepository} from "./pg-budget-repository.mjs";
function fake({failAudit=false}={}){
 const calls=[];
 return {calls,connect:async()=>({query:async(sql,args)=>{
  calls.push({sql,args});
  if(failAudit&&sql.includes("stage_job_events"))throw Error("audit unavailable");
  if(sql.startsWith("UPDATE"))return {rows:[{id:"job"}]};
  return {rows:[]};
 },release:()=>calls.push({sql:"RELEASE"})})};
}
test("reservation and audit event share one transaction",async()=>{
 const p=fake();await new PgBudgetRepository(p).reserve("job","worker","attempt","mock",200);
 assert.equal(p.calls.filter(c=>c.sql==="BEGIN").length,1);
 assert.ok(p.calls.some(c=>c.sql.includes("attempt_count=attempt_count+1")));
 assert.ok(p.calls.some(c=>c.sql.includes("stage_job_events")));
 assert.ok(p.calls.some(c=>c.sql==="COMMIT"));
});
test("audit insertion failure rolls back budget and attempt",async()=>{
 const p=fake({failAudit:true});
 await assert.rejects(new PgBudgetRepository(p).reserve("job","worker","attempt","mock",200),/audit unavailable/);
 assert.ok(p.calls.some(c=>c.sql==="ROLLBACK"));
 assert.ok(!p.calls.some(c=>c.sql==="COMMIT"));
});
test("empty provider is rejected before opening database",async()=>{
 const p=fake();
 await assert.rejects(new PgBudgetRepository(p).reserve("job","worker","attempt","",200));
 assert.equal(p.calls.length,0);
});
