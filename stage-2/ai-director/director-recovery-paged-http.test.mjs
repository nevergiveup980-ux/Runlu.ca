import test from 'node:test';
import assert from 'node:assert/strict';
import {createDirectorRecoveryPagedHandler} from './director-recovery-paged-http.mjs';
const secret='private-test-secret-with-at-least-32-bytes';
const rows=[1,2,3].map(n=>({attempt_id:'a'+n,shot_id:'S'+n,state:'UNKNOWN',provider_task_id:null,updated_at:new Date('2026-11-01T00:00:0'+n+'.000Z'),cursor_updated_at:'2026-11-01T00:00:0'+n+'.123456Z'}));
const make=(authorizeEpisode=async()=>true)=>{
 let queries=0;
 const handler=createDirectorRecoveryPagedHandler({pool:{query:async(_sql,params)=>{queries++;return {rows:params[2]?rows.filter(r=>r.attempt_id>params[3]).slice(0,params[4]):rows.slice(0,params[4])}}},resolvePrincipal:async()=>({verifiedByServer:true,subject:'reviewer'}),authorizeEpisode,cursorSecret:secret});
 return {handler,get queries(){return queries}};
};
const get=(episodeId,extra='')=>({method:'GET',url:'https://stage.invalid/api/stage/director/recovery/pages?episodeId='+episodeId+'&pageSize=2'+extra});
test('authorized paged endpoint follows signed cursor with no duplicate attempts',async()=>{
 const server=make();
 const first=await server.handler(get('ep1'));assert.equal(first.status,200);
 const a=JSON.parse(first.body).data;
 assert.deepEqual(a.items.map(x=>x.attemptId),['a1','a2']);assert.equal(a.hasMore,true);
 assert.equal(a.consistency,'live_non_atomic');assert.equal(a.requiresRefreshBeforeAction,true);
 const second=await server.handler(get('ep1','&cursor='+encodeURIComponent(a.nextCursor)));
 assert.equal(second.status,200);
 const z=JSON.parse(second.body).data;
 assert.deepEqual(z.items.map(x=>x.attemptId),['a3']);assert.equal(z.hasMore,false);
 assert.equal(server.queries,2);
});
test('cross-episode cursor and denied episode never query database',async()=>{
 const server=make();
 const first=JSON.parse((await server.handler(get('ep1'))).body).data;
 assert.equal((await server.handler(get('ep2','&cursor='+encodeURIComponent(first.nextCursor)))).status,400);
 assert.equal(server.queries,1);
 const denied=make(async()=>false);
 assert.equal((await denied.handler(get('ep1'))).status,403);
 assert.equal(denied.queries,0);
});
test('rejects writes and invalid page sizes without queries',async()=>{
 const server=make();
 assert.equal((await server.handler({...get('ep1'),method:'POST'})).status,405);
 assert.equal((await server.handler({method:'GET',url:'https://stage.invalid/api/stage/director/recovery/pages?episodeId=ep1&pageSize=101'})).status,400);
 assert.equal(server.queries,0);
});

test('all pages retain the first request cutoff rather than advancing the clock',async()=>{
 const cutoffs=[];
 const handler=createDirectorRecoveryPagedHandler({
  pool:{query:async(_sql,params)=>{
   cutoffs.push(params[5]);
   return {rows:params[2]?rows.slice(2):rows};
  }},
  resolvePrincipal:async()=>({verifiedByServer:true,subject:'reviewer'}),
  authorizeEpisode:async()=>true,cursorSecret:secret
 });
 const first=await handler(get('ep1'));
 assert.equal(first.status,200);
 const cursor=JSON.parse(first.body).data.nextCursor;
 assert.ok(cursor);
 const second=await handler(get('ep1','&cursor='+encodeURIComponent(cursor)));
 assert.equal(second.status,200);
 assert.equal(cutoffs.length,2);
 assert.equal(cutoffs[0],cutoffs[1]);
 assert.ok(Number.isSafeInteger(cutoffs[0]));
});
test('tampered signed page cursor is rejected before database access',async()=>{
 const server=make();
 const first=JSON.parse((await server.handler(get('ep1'))).body).data;
 const parts=first.nextCursor.split('.');
 const altered=parts[0].slice(0,-1)+(parts[0].at(-1)==='A'?'B':'A')+'.'+parts[1];
 const response=await server.handler(get('ep1','&cursor='+encodeURIComponent(altered)));
 assert.equal(response.status,400);
 assert.equal(server.queries,1);
});
