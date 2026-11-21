import test from "node:test";
import assert from "node:assert/strict";
import {normalizeRunwayTask,publicTaskStatus} from "./runway-task.mjs";
test("pending task stays waiting",()=>assert.equal(normalizeRunwayTask({id:"abc",status:"PENDING"}).state,"WAITING"));
test("successful task requires private ingest",()=>{const t=normalizeRunwayTask({id:"abc",status:"SUCCEEDED",output:["https://example.com/temporary.mp4"]});assert.equal(t.requiresIngest,true);assert.deepEqual(publicTaskStatus(t),{state:"PROCESSING"});});
test("success without output rejected",()=>assert.throws(()=>normalizeRunwayTask({id:"abc",status:"SUCCEEDED",output:[]})));
test("unsafe output URL rejected",()=>assert.throws(()=>normalizeRunwayTask({id:"abc",status:"SUCCEEDED",output:["http://example.com/x"]})));
test("failure maps correctly",()=>assert.equal(normalizeRunwayTask({id:"abc",status:"FAILED"}).state,"FAILED"));
test("unknown state rejected",()=>assert.throws(()=>normalizeRunwayTask({id:"abc",status:"SOMETHING"})));
