import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorSubmissionOutbox} from './pg-submission-outbox.mjs';
function pool(rows=[{attempt_id:'a1',state:'PENDING'}]){const calls=[];return {calls,query:async(sql,args)=>{calls.push({sql,args});return {rows}}};}
test('create outbox only for reserved attempt',async()=>{
 const p=pool();await new PgDirectorSubmissionOutbox(p).create({attemptId:'a1'});
 assert.match(p.calls[0].sql,/state='RESERVED'/);
 assert.match(p.calls[0].sql,/ON CONFLICT/);
});
test('claim is atomic and only from PENDING',async()=>{
 const p=pool([{attempt_id:'a1',state:'DISPATCHING'}]);
 await new PgDirectorSubmissionOutbox(p).claim({attemptId:'a1'});
 assert.match(p.calls[0].sql,/state='PENDING'/);
 assert.match(p.calls[0].sql,/b.spending_paused=false/);
 assert.match(p.calls[0].sql,/a.state='RESERVED'/);
});
test('uncertain dispatches are queried for reconciliation, not replayed',async()=>{
 const p=pool([{attempt_id:'a1',state:'UNKNOWN'}]);
 const o=new PgDirectorSubmissionOutbox(p);
 const jobs=await o.listUncertain({olderThanSeconds:300});
 assert.equal(jobs[0].state,'UNKNOWN');
 assert.match(p.calls[0].sql,/DISPATCHING','UNKNOWN/);
 assert.doesNotMatch(p.calls[0].sql,/UPDATE/);
});
test('duplicate claim and invalid provider identity fail closed',async()=>{
 const p=pool([]),o=new PgDirectorSubmissionOutbox(p);
 await assert.rejects(o.claim({attemptId:'a1'}));
 await assert.rejects(o.markSubmitted({attemptId:'a1',providerTaskId:''}));
 assert.equal(p.calls.length,1);
});

test('paused or non-reserved attempt cannot be dispatched',async()=>{
 const p=pool([]),o=new PgDirectorSubmissionOutbox(p);
 await assert.rejects(o.claim({attemptId:'a1'}),/spending paused/);
 assert.equal(p.calls.length,1);
 assert.match(p.calls[0].sql,/JOIN stage_director_budgets/);
 assert.match(p.calls[0].sql,/b.spending_paused=false/);
});
