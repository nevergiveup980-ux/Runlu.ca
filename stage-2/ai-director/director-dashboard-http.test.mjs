import test from 'node:test';
import assert from 'node:assert/strict';
import {createDirectorDashboardHandler} from './director-dashboard-http.mjs';
function pool(){
 const client={query:async(sql)=>{
 if(sql.includes('FROM stage_director_budgets b'))return {rows:[{episode_id:'ep1',limit_cents:1000,spending_paused:false,pause_reason:null,confirmed_by:'owner',reviewer_id:'editor'}]};
 if(sql.includes('FROM stage_director_shot_jobs'))return {rows:[]};
 if(sql.includes('FROM stage_director_attempts a'))return {rows:[]};
 return {rows:[]};
 },release:()=>{}};
 return {connect:async()=>client};
}
const request={method:'GET',url:'https://example.test/api/stage/director/episode?episodeId=ep1'};
test('returns authorized validated dashboard with no-store headers',async()=>{
 const h=createDirectorDashboardHandler({pool:pool(),resolvePrincipal:async()=>({verifiedByServer:true,subject:'user1'}),authorizeEpisode:async()=>true});
 const r=await h(request);
 assert.equal(r.status,200);assert.equal(JSON.parse(r.body).data.episodeId,'ep1');
 assert.equal(r.headers['cache-control'],'no-store');
});
test('denies unverified identity and never leaks internal details',async()=>{
 const h=createDirectorDashboardHandler({pool:pool(),resolvePrincipal:async()=>({subject:'user1',role:'admin'}),authorizeEpisode:async()=>true});
 const r=await h(request);assert.equal(r.status,403);
 assert.deepEqual(JSON.parse(r.body),{error:'access_denied'});
});
test('rejects mutation and invalid episode',async()=>{
 const h=createDirectorDashboardHandler({pool:pool(),resolvePrincipal:async()=>null,authorizeEpisode:async()=>false});
 assert.equal((await h({...request,method:'POST'})).status,405);
 assert.equal((await h({...request,url:'https://example.test/api/stage/director/episode?episodeId=bad%20id'})).status,400);
});
test('requires server-side principal verification and hides resolver failures',async()=>{
 assert.throws(()=>createDirectorDashboardHandler({pool:pool(),authorizeEpisode:async()=>true}),/resolver/);
 const h=createDirectorDashboardHandler({pool:pool(),resolvePrincipal:async()=>{throw Error('token-secret')},authorizeEpisode:async()=>true});
 const r=await h(request);assert.equal(r.status,500);
 assert.ok(!r.body.includes('token-secret'));
});

test('spoofed request identity cannot override server verified principal',async()=>{
 let checked;const h=createDirectorDashboardHandler({pool:pool(),
  resolvePrincipal:async()=>({verifiedByServer:true,subject:'actual-user'}),
  authorizeEpisode:async args=>(checked=args,false)});
 const r=await h({...request,headers:{'x-user-id':'owner','x-user-role':'admin'},principal:{verifiedByServer:true,subject:'owner'}});
 assert.equal(r.status,403);
 assert.equal(checked.subject,'actual-user');
});
test('authorization lookup errors fail without leaking membership details',async()=>{
 const h=createDirectorDashboardHandler({pool:pool(),
  resolvePrincipal:async()=>({verifiedByServer:true,subject:'actual-user'}),
  authorizeEpisode:async()=>{throw Error('private-membership-table-failure')}});
 const r=await h(request);assert.equal(r.status,500);
 assert.deepEqual(JSON.parse(r.body),{error:'internal_error'});
 assert.equal(r.body.includes('private-membership-table-failure'),false);
});
