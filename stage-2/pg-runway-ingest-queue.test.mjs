import test from 'node:test';
import assert from 'node:assert/strict';
import {PgRunwayIngestQueue} from './pg-runway-ingest-queue.mjs';
function pool(first=[{provider_task_id:'t1'}],second=[]){const calls=[];let n=0;return {calls,query:async(sql,args)=>{calls.push({sql,args});return {rows:n++===0?first:second}}};}
test('enqueues only provider task ID',async()=>{const p=pool();const r=await new PgRunwayIngestQueue(p).enqueue({idempotencyKey:'t1',providerTaskId:'t1'});assert.equal(r.accepted,true);assert.deepEqual(p.calls[0].args,['t1']);assert.match(p.calls[0].sql,/ON CONFLICT/);});
test('existing task is idempotent',async()=>{const p=pool([],[{state:'QUEUED'}]);const r=await new PgRunwayIngestQueue(p).enqueue({idempotencyKey:'t1',providerTaskId:'t1'});assert.equal(r.alreadyQueued,true);});
test('ineligible task fails closed',async()=>{await assert.rejects(new PgRunwayIngestQueue(pool([],[])).enqueue({idempotencyKey:'t1',providerTaskId:'t1'}),/not eligible/);});
test('rejects inconsistent identity before database query',async()=>{const p=pool();await assert.rejects(new PgRunwayIngestQueue(p).enqueue({idempotencyKey:'wrong',providerTaskId:'t1'}));assert.equal(p.calls.length,0);});
