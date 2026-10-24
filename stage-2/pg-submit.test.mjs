import test from "node:test";
import assert from "node:assert/strict";
import {PgJobSubmitter} from "./pg-submit.mjs";
const brief={durationSeconds:30,quality:"standard",format:"cinematic"};
function fake({existing=null,fail=false}={}){
 const calls=[];
 return {calls,connect:async()=>({query:async(sql,args)=>{
  calls.push({sql,args});
  if(fail&&sql.startsWith("INSERT"))throw Error("Database error");
  if(sql.startsWith("INSERT"))return {rows:existing?[]:[{id:"new"}]};
  if(sql.startsWith("SELECT"))return {rows:existing?[existing]:[]};
  return {rows:[]};
 },release:()=>calls.push({sql:"RELEASE"})})};
}
test("new request inserts once",async()=>{
 const p=fake();const r=await new PgJobSubmitter(p).submit({ownerId:"owner",idempotencyKey:"key",brief,budgetCents:500});
 assert.equal(r.created,true);assert.ok(p.calls.some(c=>c.sql==="COMMIT"));
});
test("duplicate request returns original job",async()=>{
 const first=fake();await new PgJobSubmitter(first).submit({ownerId:"owner",idempotencyKey:"key",brief,budgetCents:500});
 const request=JSON.parse(first.calls.find(c=>c.sql.startsWith("INSERT")).args[3]);
 const p=fake({existing:{id:"original",request_json:request,budget_cents:"500"}});
 const r=await new PgJobSubmitter(p).submit({ownerId:"owner",idempotencyKey:"key",brief,budgetCents:500});
 assert.deepEqual(r,{id:"original",created:false});
});
test("key reuse with changed brief is rejected",async()=>{
 const p=fake({existing:{id:"original",request_json:{requestHash:"different"},budget_cents:"500"}});
 await assert.rejects(new PgJobSubmitter(p).submit({ownerId:"owner",idempotencyKey:"key",brief,budgetCents:500}),/different request/);
 assert.ok(p.calls.some(c=>c.sql==="ROLLBACK"));
});
test("database failure rolls back",async()=>{
 const p=fake({fail:true});
 await assert.rejects(new PgJobSubmitter(p).submit({ownerId:"owner",idempotencyKey:"key",brief,budgetCents:500}));
 assert.ok(p.calls.some(c=>c.sql==="ROLLBACK"));
});
test("invalid brief never touches database",async()=>{
 const p=fake();await assert.rejects(new PgJobSubmitter(p).submit({ownerId:"owner",idempotencyKey:"key",brief:{...brief,durationSeconds:500},budgetCents:500}));
 assert.equal(p.calls.length,0);
});
