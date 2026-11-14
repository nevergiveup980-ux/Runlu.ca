import test from 'node:test';
import assert from 'node:assert/strict';
import {createMusicHandler} from './handler.mjs';
import {createSupabaseBackend} from './supabase-backend.mjs';
const owner='00000000-0000-4000-8000-000000000a01',other='00000000-0000-4000-8000-000000000b02',id='00000000-0000-4000-8000-000000002a01';
const row={version_id:id,song_id:id,owner_id:owner,title:'夜色 / Love',version:'V2',duration:182,created_at:'2026-11-12T01:00:00Z',generation_status:'imported',object_key:`${owner}/${id}.mp3`,sha256:'privatehash'};
function fixture(overrides={}){
 const calls=[];
 const backend={verify:async()=>({id:owner}),list:async()=>[row],get:async()=>row,sign:async(...args)=>{calls.push(args);return 'https://example.test/signed';},audio:async(_row,_token,range)=>new Response(new Uint8Array([1,2,3]),{status:range?206:200,headers:range?{'Content-Range':'bytes 0-2/100','Content-Length':'3'}:{}}),...overrides};
 return {calls,handle:createMusicHandler({backend,allowedOrigins:['http://127.0.0.1:4173']})};
}
const request=(path,headers={})=>new Request('http://127.0.0.1:4173/api/music/'+path,{headers:{Authorization:'Bearer verified',...headers}});
test('all routes require verified non-anonymous user, generation cannot be posted',async()=>{
 const {handle}=fixture();assert.equal((await handle(new Request('http://localhost/api/music/library'))).status,401);
 assert.equal((await fixture({verify:async()=>({id:owner,is_anonymous:true})}).handle(request('library'))).status,401);
 assert.equal((await handle(new Request('http://localhost/api/music/jobs',{method:'POST'}))).status,405);
 assert.equal((await handle(request('library',{Origin:'https://evil.test'}))).status,403);
});
test('library returns version metadata and excludes object key/hash',async()=>{
 const result=await fixture().handle(request('library'));assert.equal(result.status,200);
 const text=await result.text();assert.match(text,/'?V2/);assert.ok(!text.includes('object_key'));assert.ok(!text.includes('privatehash'));
});
test('another user, unavailable and incomplete songs never get signed',async()=>{
 for(const patch of [{owner_id:other},{generation_status:'failed',object_key:null},{duration:null}]){
  const {handle,calls}=fixture({get:async()=>({...row,...patch})});assert.ok([404,409].includes((await handle(request(`songs/${id}/access`))).status));assert.equal(calls.length,0);
 }
});
test('download is named, fresh and never cached; range proxy preserves 206',async()=>{
 const {handle,calls}=fixture();const signed=await handle(request(`songs/${id}/access?download=1`));
 assert.equal(signed.headers.get('cache-control'),'no-store');assert.equal(calls[0][2],'夜色 - Love-V2.mp3');assert.equal((await signed.json()).expires_in,60);
 const audio=await handle(request(`songs/${id}/audio?download=1`,{Range:'bytes=0-2'}));assert.equal(audio.status,206);assert.equal(audio.headers.get('content-range'),'bytes 0-2/100');assert.match(audio.headers.get('content-disposition'),/filename\*=UTF-8/);
 assert.equal((await handle(request(`songs/${id}/audio`,{Range:'bytes=0-1,3-4'}))).status,400);
});
test('upstream failures are redacted and list enforces owner scope',async()=>{
 const result=await fixture({list:async()=>{throw Error('secret-key')},}).handle(request('library'));
 assert.equal(result.status,503);assert.ok(!(await result.text()).includes('secret-key'));
 assert.equal((await fixture({list:async()=>[{...row,owner_id:other}]}).handle(request('library'))).status,404);
});
test('Supabase backend uses user JWT for ownership-filtered list and signer; validates returned origin',async()=>{
 const calls=[];const backend=createSupabaseBackend({url:'https://project.supabase.co',publishableKey:'public',fetchImpl:async(url,opts)=>{
  calls.push([url,opts]);return new Response(JSON.stringify(url.includes('/sign/')?{signedURL:`/object/sign/runlu-music-private/${row.object_key}?token=temporary`}:[]),{status:200});}});
 await backend.list(owner,'user-token',{limit:20});assert.match(calls[0][0],/owner_id=eq/);assert.equal(calls[0][1].headers.Authorization,'Bearer user-token');
 assert.match(await backend.sign(row,'user-token','Song-V2.mp3'),/^https:\/\/project\.supabase\.co\/storage\/v1\/object\/sign/);
 await assert.rejects(backend.sign({...row,object_key:`${other}/${id}.mp3`},'user-token'),/AUDIO_NOT_READY/);
 await assert.rejects(backend.list(owner,'user-token',{before:'SQL injection'}),/INVALID_CURSOR/);
 const unsafe=createSupabaseBackend({url:'https://project.supabase.co',publishableKey:'public',fetchImpl:async()=>new Response(JSON.stringify({signedURL:'https://evil.test/steal'}))});
 await assert.rejects(unsafe.sign(row,'user-token'),/AUDIO_NOT_READY/);
});
test('out-of-bounds byte ranges preserve Storage 416 and Content-Range',async()=>{
 const backend=createSupabaseBackend({url:'https://project.supabase.co',publishableKey:'public',fetchImpl:async()=>new Response(null,{status:416,headers:{'Content-Range':'bytes */100','Content-Length':'50'}})});
 const upstream=await backend.audio(row,'user-token','bytes=1000-');assert.equal(upstream.status,416);
 const {handle}=fixture({audio:async()=>upstream});
 const response=await handle(request(`songs/${id}/audio`,{Range:'bytes=1000-'}));
 assert.equal(response.status,416);assert.equal(response.headers.get('content-length'),null);assert.equal(response.headers.get('content-range'),'bytes */100');assert.equal(await response.text(),'');
});
