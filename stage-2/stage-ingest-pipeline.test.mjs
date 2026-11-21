import test from 'node:test';
import assert from 'node:assert/strict';
import {createStageIngestPipeline} from './stage-ingest-pipeline.mjs';
const bytes=Buffer.alloc(32);bytes.write('ftyp',4);
function setup(){
 const calls=[];return {calls,
  queue:{claim:async()=>({providerTaskId:'task1'}),complete:async(...args)=>calls.push(['complete',...args]),flagForReview:async()=>calls.push(['review'])},
  provider:{getTask:async()=>({id:'task1',status:'SUCCEEDED',output:['https://cdn.example.org/video.mp4']})},
  fetchImpl:async()=>new Response(bytes,{status:200,headers:{'content-length':'32'}}),
  allowedHosts:['cdn.example.org'],
  probe:async()=>({duration:5,streams:[{codec_type:'video',codec_name:'h264',width:1280,height:720}]}),
  putObject:async x=>calls.push(['put',x]),
  bucket:'stage-private',workerId:'worker1'};
}
test('composed pipeline validates, stores and completes',async()=>{
 const s=setup();const result=await createStageIngestPipeline(s)();
 assert.equal(result.state,'VERIFIED');assert.deepEqual(s.calls.map(x=>x[0]),['put','complete']);
 assert.equal(s.calls[0][1].private,true);
});
test('unapproved provider host blocks storage and flags review',async()=>{
 const s=setup();s.allowedHosts=['other.example.org'];
 const result=await createStageIngestPipeline(s)();
 assert.equal(result.state,'REVIEW_REQUIRED');assert.deepEqual(s.calls.map(x=>x[0]),['review']);
});
test('invalid MP4 blocks storage and flags review',async()=>{
 const s=setup();s.fetchImpl=async()=>new Response(Buffer.alloc(32));
 const result=await createStageIngestPipeline(s)();
 assert.equal(result.state,'REVIEW_REQUIRED');assert.deepEqual(s.calls.map(x=>x[0]),['review']);
});
