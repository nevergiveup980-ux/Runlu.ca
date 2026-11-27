import test from "node:test";
import assert from "node:assert/strict";
import {createDeliveryMaintenanceRunner} from "./delivery-maintenance-runner.mjs";
test("runner skips overlapping invocation and permits later run",async()=>{
 let release;let calls=0;
 const gate=new Promise(resolve=>{release=resolve;});
 const pool={query:async()=>{calls++;if(calls===1)await gate;return {rows:[]};}};
 const runner=createDeliveryMaintenanceRunner({pool,maxAttempts:1});
 const first=runner.run();
 await new Promise(resolve=>setImmediate(resolve));
 const second=await runner.run();
 assert.deepEqual(second,{ok:false,skipped:true,reason:"already_running"});
 assert.equal(calls,1);
 release();
 assert.equal((await first).ok,true);
 assert.equal((await runner.run()).ok,true);
 assert.equal(calls,2);
});
test("runner releases lock after database failure",async()=>{
 let calls=0;
 const runner=createDeliveryMaintenanceRunner({pool:{query:async()=>{calls++;if(calls===1)throw Error("offline");return {rows:[]};}},maxAttempts:1});
 await assert.rejects(runner.run(),/offline/);
 assert.equal((await runner.run()).ok,true);
 assert.equal(calls,2);
});
