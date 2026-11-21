import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRecoveryPageQuery,sliceRecoveryPage} from './pg-recovery-page-query.mjs';
test('first page is parameterized, bounded and ordered deterministically',()=>{
 const q=buildRecoveryPageQuery({episodeId:'ep1'});
 assert.deepEqual(q.values,['ep1',300,51]);
 assert.ok(q.text.includes('ORDER BY o.updated_at,o.attempt_id LIMIT $3'));
 assert.doesNotMatch(q.text,/OFFSET/);
 assert.ok(q.text.includes("o.state IN ('DISPATCHING','UNKNOWN')"));
});
test('next page uses tuple keyset and parameterized values',()=>{
 const q=buildRecoveryPageQuery({episodeId:'ep1',pageSize:100,after:{updatedAt:'2026-11-16T12:30:00.123Z',attemptId:'a_9'}});
 assert.deepEqual(q.values,['ep1',300,101,'2026-11-16T12:30:00.123Z','a_9']);
 assert.ok(q.text.includes('(o.updated_at,o.attempt_id) > ($4::timestamptz,$5::text)'));
});
test('invalid cursor tuple and overlarge page are rejected',()=>{
 for(const bad of [{updatedAt:'bad',attemptId:'a1'},{updatedAt:'2026-11-16T12:30:00Z',attemptId:'x;DROP'},{updatedAt:'2026-11-16T12:30:00Z'}])
  assert.throws(()=>buildRecoveryPageQuery({episodeId:'ep1',after:bad}));
 assert.throws(()=>buildRecoveryPageQuery({episodeId:'ep1',pageSize:101}));
});
test('lookahead row determines hasMore without exposing extra record',()=>{
 assert.deepEqual(sliceRecoveryPage([1,2,3],2),{rows:[1,2],hasMore:true});
 assert.deepEqual(sliceRecoveryPage([1,2],2),{rows:[1,2],hasMore:false});
 assert.throws(()=>sliceRecoveryPage([1,2,3,4],2));
});
