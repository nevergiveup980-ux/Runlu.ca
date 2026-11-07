import test from "node:test";
import assert from "node:assert/strict";
import {PgProviderTaskRepository} from "./pg-provider-task-repository.mjs";
function fakePool(rows=[{id:"attempt"}]) {
 const calls=[];
 return {calls,query:async(sql,args)=>{calls.push({sql,args});return {rows};}};
}
test("marks a reserved attempt submitting before external call",async()=>{
 const pool=fakePool();const repo=new PgProviderTaskRepository(pool);
 assert.equal((await repo.markSubmitting("a")).submissionState,"SUBMITTING");
 assert.match(pool.calls[0].sql,/submission_state='NOT_SENT'/);
});
test("saves provider task ID only after submitting",async()=>{
 const pool=fakePool();const repo=new PgProviderTaskRepository(pool);
 await repo.markSubmitted("a","task-123");
 assert.deepEqual(pool.calls[0].args,["a","task-123"]);
 assert.match(pool.calls[0].sql,/submission_state='SUBMITTING'/);
});
test("rejects blank provider task ID",async()=>{
 const pool=fakePool();const repo=new PgProviderTaskRepository(pool);
 await assert.rejects(repo.markSubmitted("a"," "));assert.equal(pool.calls.length,0);
});
test("ambiguous submission is recorded for reconciliation",async()=>{
 const pool=fakePool();const repo=new PgProviderTaskRepository(pool);
 await repo.markUnknown("a");assert.match(pool.calls[0].sql,/RECONCILIATION_REQUIRED/);
});
test("does not silently re-mark an ineligible attempt",async()=>{
 const repo=new PgProviderTaskRepository(fakePool([]));
 await assert.rejects(repo.markSubmitting("a"));
});
test("lists unresolved attempts with bounded query",async()=>{
 const pool=fakePool([]);const repo=new PgProviderTaskRepository(pool);
 await repo.listUnresolved(20);assert.deepEqual(pool.calls[0].args,[20]);
 await assert.rejects(repo.listUnresolved(501));
});
