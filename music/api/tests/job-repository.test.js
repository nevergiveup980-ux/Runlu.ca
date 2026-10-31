import test from "node:test";
import assert from "node:assert/strict";
import {createJobRepository} from "../job-repository.js";
const base={id:"job_123",ownerId:"owner_1",idempotencyKey:"idem_12345678",prompt:"故乡、父母、岁月",language:"zh",durationSeconds:30,instrumental:false,now:100};
function mockDb(){
 const calls=[];const existing={id:base.id,owner_id:base.ownerId,status:"queued",track_id:null,error_code:null,error_message:null,created_at:100,updated_at:100};
 return {calls,prepare(sql){const entry={sql,args:[]};calls.push(entry);return {bind(...args){entry.args=args;return this;},async run(){return {meta:{changes:1}};},async first(){return existing;}};}};
}
test("D1 is mandatory",()=>assert.throws(()=>createJobRepository(null),{code:"DB_NOT_CONFIGURED"}));
test("creation uses owner-scoped idempotency and parameterized SQL",async()=>{
 const db=mockDb();const result=await createJobRepository(db).create(base);
 assert.equal(result.status,"queued");assert.match(db.calls[0].sql,/INSERT OR IGNORE/);
 assert.match(db.calls[1].sql,/owner_id=\? AND idempotency_key=\?/);
 assert.equal(db.calls[0].args[1],"owner_1");
});
test("owner-scoped retrieval never queries by ID alone",async()=>{
 const db=mockDb();await createJobRepository(db).getForOwner({id:"job_123",ownerId:"owner_1"});
 assert.match(db.calls[0].sql,/id=\? AND owner_id=\?/);
});
test("running transition is conditional on queued state",async()=>{
 const db=mockDb();assert.equal(await createJobRepository(db).markRunning({id:"job_123",ownerId:"owner_1",now:101}),true);
 assert.match(db.calls[0].sql,/status='queued' AND updated_at<=\?/);
});
test("invalid IDs rejected before database calls",async()=>{
 const db=mockDb();await assert.rejects(()=>createJobRepository(db).getForOwner({id:"../bad",ownerId:"owner_1"}),{code:"INVALID_JOB"});assert.equal(db.calls.length,0);
});
