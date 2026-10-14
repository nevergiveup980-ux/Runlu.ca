import test from "node:test";
import assert from "node:assert/strict";
import { JobQueue } from "./queue.mjs";
import { MockVideoProvider } from "./mock-provider.mjs";
const brief={durationSeconds:60,quality:"standard",format:"cinematic"};
test("mock provider completes without paid API",async()=>{
 const q=new JobQueue({provider:new MockVideoProvider()});
 const j=q.submit(brief,5); const done=await q.run(j.id);
 assert.equal(done.status,"COMPLETED"); assert.equal(done.spentCad,0);
 assert.equal(done.result.kind,"mock-video");
});
test("retries are logged",async()=>{
 const q=new JobQueue({provider:new MockVideoProvider({failFirst:true,billedCad:1}),maxAttempts:2});
 const j=q.submit(brief,3); const done=await q.run(j.id);
 assert.equal(done.status,"COMPLETED"); assert.equal(done.attempts,2);assert.equal(done.spentCad,2);
});
test("budget overrun blocks completion",async()=>{
 const q=new JobQueue({provider:new MockVideoProvider({billedCad:8}),maxSpendCad:6});
 const j=q.submit(brief,5); const done=await q.run(j.id);
 assert.equal(done.status,"BUDGET_EXCEEDED");
});
test("reject jobs over estimated budget",()=>{
 const q=new JobQueue({provider:new MockVideoProvider(),maxSpendCad:6});
 assert.throws(()=>q.submit(brief,7));
});
test("jobs cannot be run twice",async()=>{
 const q=new JobQueue({provider:new MockVideoProvider()});
 const j=q.submit(brief,5);await q.run(j.id);
 await assert.rejects(()=>q.run(j.id));
});
test("snapshots cannot mutate internal records",()=>{
 const q=new JobQueue({provider:new MockVideoProvider()});
 const j=q.submit(brief,5);j.events.push({status:"HACK"});
 assert.equal(q.snapshot(j.id).events.length,1);
});
