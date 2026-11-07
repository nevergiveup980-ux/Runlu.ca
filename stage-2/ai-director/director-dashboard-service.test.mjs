import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectorDashboardService,DirectorAccessDenied} from './director-dashboard-service.mjs';
function pool(){
 const calls=[];const client={query:async(sql)=>{
 calls.push(sql);
 if(sql.includes('FROM stage_director_budgets b'))return {rows:[{episode_id:'ep1',limit_cents:1000,spending_paused:false,pause_reason:null,confirmed_by:'owner',reviewer_id:'editor'}]};
 if(sql.includes('FROM stage_director_shot_jobs'))return {rows:[]};
 if(sql.includes('FROM stage_director_attempts a'))return {rows:[]};
 return {rows:[]};
 },release:()=>{}};
 return {calls,connect:async()=>client};
}
test('verified and episode-authorized principal reads dashboard',async()=>{
 const db=pool();let checked;
 const svc=new DirectorDashboardService({pool:db,authorizeEpisode:async args=>(checked=args,true)});
 const d=await svc.getEpisode({principal:{verifiedByServer:true,subject:'user1'},episodeId:'ep1'});
 assert.equal(d.episodeId,'ep1');assert.equal(checked.permission,'director:read');
 assert.ok(db.calls.length>0);
});
test('unverified client role is rejected before any database query',async()=>{
 const db=pool();const svc=new DirectorDashboardService({pool:db,authorizeEpisode:async()=>true});
 await assert.rejects(svc.getEpisode({principal:{subject:'user1',role:'admin'},episodeId:'ep1'}),DirectorAccessDenied);
 assert.equal(db.calls.length,0);
});
test('verified user without episode membership is rejected',async()=>{
 const db=pool();const svc=new DirectorDashboardService({pool:db,authorizeEpisode:async()=>false});
 await assert.rejects(svc.getEpisode({principal:{verifiedByServer:true,subject:'user2'},episodeId:'ep1'}),DirectorAccessDenied);
 assert.equal(db.calls.length,0);
});
test('requires explicit authorization callback',()=>{
 assert.throws(()=>new DirectorDashboardService({pool:pool()}),/authorization callback/);
});
