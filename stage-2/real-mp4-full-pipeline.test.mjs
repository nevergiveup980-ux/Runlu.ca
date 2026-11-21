import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createStageIngestPipeline} from './stage-ingest-pipeline.mjs';

test('real H264 MP4 completes entire offline provider-to-private-storage ingest',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'runlu-stage-pipeline-'));
 try{
  const path=join(dir,'video.mp4');
  await new Promise((resolve,reject)=>{
   const child=spawn('ffmpeg',['-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=blue:s=160x120:r=5','-t','1','-an','-c:v','libx264','-pix_fmt','yuv420p','-y',path],{stdio:'ignore'});
   child.on('error',reject);child.on('close',code=>code===0?resolve():reject(Error('fixture generation failed')));
  });
  const bytes=await readFile(path);
  const events=[];
  const pipeline=createStageIngestPipeline({
   queue:{
    claim:async()=>({providerTaskId:'task_real_mp4'}),
    complete:async(taskId,workerId,key)=>events.push({type:'complete',taskId,workerId,key}),
    flagForReview:async()=>events.push({type:'review'})
   },
   provider:{getTask:async()=>({id:'task_real_mp4',status:'SUCCEEDED',output:['https://trusted.example.test/video.mp4']})},
   fetchImpl:async()=>new Response(bytes,{status:200,headers:{'content-length':String(bytes.length)}}),
   allowedHosts:['trusted.example.test'],
   putObject:async obj=>events.push({type:'stored',obj}),
   bucket:'stage-private',workerId:'offline-test-worker'
  });
  const result=await pipeline();
  assert.equal(result.state,'VERIFIED');
  assert.deepEqual(events.map(x=>x.type),['stored','complete']);
  assert.deepEqual(events[0].obj.body,bytes);
  assert.equal(events[0].obj.private,true);
  assert.equal(events[1].key,events[0].obj.key);
 }finally{await rm(dir,{recursive:true,force:true});}
});
