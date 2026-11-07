import test from 'node:test';
import assert from 'node:assert/strict';
import {DirectorDashboardClient} from './director-dashboard-client.mjs';
const json=(status,data)=>({status,ok:status>=200&&status<300,headers:{get:()=> 'application/json'},json:async()=>({data})});
test('loads same-origin read-only episode data',async()=>{
 let called;const c=new DirectorDashboardClient({fetchImpl:async(...args)=>(called=args,json(200,{episodeId:'ep1'}))});
 assert.equal((await c.load('ep1')).episodeId,'ep1');
 assert.match(called[0],/^\/api\/stage\/director\/episode/);
 assert.equal(called[1].credentials,'same-origin');
 assert.equal(called[1].cache,'no-store');
});
test('access denied and server errors have distinct states',async()=>{
 await assert.rejects(new DirectorDashboardClient({fetchImpl:async()=>json(403)}).load('ep1'),/access_denied/);
 await assert.rejects(new DirectorDashboardClient({fetchImpl:async()=>json(500)}).load('ep1'),/server_error/);
});
test('rejects mismatched episode and invalid IDs',async()=>{
 await assert.rejects(new DirectorDashboardClient({fetchImpl:async()=>json(200,{episodeId:'ep2'})}).load('ep1'),/invalid_response/);
 await assert.rejects(new DirectorDashboardClient({fetchImpl:async()=>json(200,{episodeId:'ep1'})}).load('../bad'),/Invalid/);
});
test('does not mask request cancellation',async()=>{
 const e=new Error('cancel');e.name='AbortError';
 await assert.rejects(new DirectorDashboardClient({fetchImpl:async()=>{throw e}}).load('ep1'),x=>x.name==='AbortError');
});
