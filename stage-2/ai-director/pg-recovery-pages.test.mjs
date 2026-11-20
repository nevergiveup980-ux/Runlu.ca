import test from 'node:test';
import assert from 'node:assert/strict';
import {PgDirectorRecoveryPages} from './pg-recovery-pages.mjs';
const row=(n)=>({attempt_id:'a'+n,shot_id:'S'+n,state:n%2?'UNKNOWN':'DISPATCHING',provider_task_id:null,updated_at:new Date('2026-01-01T00:00:00.000Z'),cursor_updated_at:'2026-01-01T00:00:00.123456Z'});
test('uses parameterized keyset query and fetches one extra row',async()=>{
 let captured;
 const pages=new PgDirectorRecoveryPages({query:async(sql,args)=>{captured={sql,args};return {rows:[row(1),row(2),row(3)]}}});
 const page=await pages.inspectPage({episodeId:'ep1',pageSize:2});
 assert.equal(page.items.length,2);assert.equal(page.hasMore,true);
 assert.deepEqual(page.nextKey,{updatedAt:'2026-01-01T00:00:00.123456Z',attemptId:'a2'});
 assert.deepEqual(captured.args,['ep1',300,null,null,3]);
 assert.match(captured.sql,/cursor_updated_at/);\n assert.match(captured.sql,/ORDER BY o.updated_at,o.attempt_id LIMIT \$5/);
 assert.equal(page.items[0].retryAllowed,false);
});
test('validated keyset is passed as SQL values, not interpolated',async()=>{
 let args;
 const pages=new PgDirectorRecoveryPages({query:async(_,params)=>{args=params;return {rows:[]}}});
 const after={updatedAt:'2026-01-01T00:00:00.000Z',attemptId:'a2'};
 const page=await pages.inspectPage({episodeId:'ep1',after});
 assert.equal(page.hasMore,false);assert.equal(page.nextKey,null);
 assert.deepEqual(args,['ep1',300,after.updatedAt,'a2',51]);
});
test('rejects invalid cursors and oversized limits before querying',async()=>{
 let calls=0;const pages=new PgDirectorRecoveryPages({query:async()=>{calls++;return {rows:[]}}});
 for(const options of [{episodeId:'ep1',pageSize:101},{episodeId:'ep1',after:{updatedAt:'bad',attemptId:'a1'}},{episodeId:'ep1',after:{updatedAt:'2026-01-01T00:00:00Z',attemptId:'a;DROP'}}]){
  await assert.rejects(pages.inspectPage(options));
 }
 assert.equal(calls,0);
});
