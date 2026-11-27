import test from 'node:test';
import assert from 'node:assert/strict';
import {createDirectorRecoveryHandler} from './director-recovery-http.mjs';
const url='https://stage.invalid/api/stage/director/recovery?episodeId=ep1';
function fixture({verified=true,permitted=true,rows=[]}={}){
 const calls=[];const handler=createDirectorRecoveryHandler({
  pool:{query:async(sql,args)=>{calls.push({sql,args});return {rows}}},
  resolvePrincipal:async()=>verified?{verifiedByServer:true,subject:'real-user'}:{subject:'spoofed'},
  authorizeEpisode:async args=>{calls.push({authorization:args});return permitted}
 });
 return {handler,calls};
}
test('authorized read returns recovery-only records and no-store',async()=>{
 const f=fixture({rows:[{attempt_id:'a1',shot_id:'s1',state:'UNKNOWN',provider_task_id:null,updated_at:'2026-11-11',attempt_state:'UNKNOWN',shot_state:'UNKNOWN'}]});
 const r=await f.handler({method:'GET',url});
 assert.equal(r.status,200);assert.equal(r.headers['cache-control'],'no-store');
 assert.equal(JSON.parse(r.body).data.items[0].retryAllowed,false);
 assert.equal(f.calls[0].authorization.permission,'director:read');
 assert.equal(f.calls[1].args[0],'ep1');
});
test('unauthenticated and unauthorized requests do not query database',async()=>{
 for(const opts of [{verified:false},{permitted:false}]){
  const f=fixture(opts);const r=await f.handler({method:'GET',url,headers:{'x-user-role':'admin'}});
  assert.equal(r.status,403);assert.equal(f.calls.some(x=>x.sql),false);
 }
});
test('POST, malformed IDs and wrong routes are rejected',async()=>{
 const f=fixture();
 assert.equal((await f.handler({method:'POST',url})).status,405);
 assert.equal((await f.handler({method:'GET',url:url.replace('ep1','bad%20id')})).status,400);
 assert.equal((await f.handler({method:'GET',url:'https://stage.invalid/other'})).status,404);
 assert.equal(f.calls.length,0);
});
test('database errors do not leak private SQL details',async()=>{
 const handler=createDirectorRecoveryHandler({
  pool:{query:async()=>{throw Error('secret-table-name')}},
  resolvePrincipal:async()=>({verifiedByServer:true,subject:'owner'}),
  authorizeEpisode:async()=>true
 });
 const r=await handler({method:'GET',url});
 assert.equal(r.status,500);assert.equal(r.body.includes('secret-table-name'),false);
});
